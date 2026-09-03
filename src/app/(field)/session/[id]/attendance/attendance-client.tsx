'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, UserCircle, WarningCircle } from '@phosphor-icons/react';
import { QrScanner } from '@/components/field/qr-scanner';
import { cacheAttendanceSetup, loadCachedAttendanceSetup } from '@/lib/attendance/cache';
import type { AttendanceSetupData, AttendanceSetupPlayer } from '@/lib/attendance/types';
import { isPresentStatus } from '@/lib/attendance/qr';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';
import { db } from '@/lib/db';
import {
  markAttendanceLocal,
  type AttendanceStatus,
} from '@/lib/sync/record-attendance';
import { Button } from '@/components/ui/button';
import { StatNumber } from '@/components/ui/stat-number';
import { cn } from '@/lib/utils';

type Flash = { type: 'success' | 'error' | 'info'; message: string };

const MANUAL_CYCLE: Array<AttendanceStatus | null> = [null, 'present', 'late', 'absent'];

function nextManualStatus(current: AttendanceStatus | null): AttendanceStatus | null {
  const index = MANUAL_CYCLE.indexOf(current);
  const nextIndex = index === -1 ? 1 : (index + 1) % MANUAL_CYCLE.length;
  return MANUAL_CYCLE[nextIndex] ?? null;
}

function statusLabel(status: AttendanceStatus | null): string {
  switch (status) {
    case 'present':
      return 'Hadir';
    case 'late':
      return 'Terlambat';
    case 'absent':
      return 'Absen';
    default:
      return 'Belum';
  }
}

function statusClass(status: AttendanceStatus | null): string {
  switch (status) {
    case 'present':
      return 'bg-[var(--color-made)]/15 text-[var(--color-made)] border-[var(--color-made)]/30';
    case 'late':
      return 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30';
    case 'absent':
      return 'bg-[var(--color-miss)]/15 text-[var(--color-miss)] border-[var(--color-miss)]/30';
    default:
      return 'bg-[var(--color-field-surface)] text-[var(--color-field-text-3)] border-[var(--color-field-border)]';
  }
}

export function AttendanceClient({
  sessionId,
  sessionDate,
  teamName,
  coachId,
}: {
  sessionId: string;
  sessionDate: string;
  teamName: string;
  coachId: string;
}) {
  const [roster, setRoster] = useState<AttendanceSetupPlayer[]>([]);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [ready, setReady] = useState(false);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [savingPlayerId, setSavingPlayerId] = useState<string | null>(null);

  const rosterMap = useMemo(() => new Map(roster.map((player) => [player.id, player])), [roster]);

  const presentCount = useMemo(
    () => roster.filter((player) => isPresentStatus(player.status)).length,
    [roster],
  );

  const applySetup = useCallback((data: AttendanceSetupData, fromCache = false) => {
    setRoster(data.roster);
    setOfflineOnly(fromCache);
    setReady(true);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        if (navigator.onLine) {
          const setupRes = await fetch(`/api/sessions/${sessionId}/attendance-setup`, {
            credentials: 'include',
          });

          if (setupRes.ok) {
            const data = (await setupRes.json()) as AttendanceSetupData;
            await cacheAttendanceSetup(data);
            applySetup(data);
            return;
          }

          const bootstrapRes = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
            credentials: 'include',
          });

          if (bootstrapRes.ok) {
            const data = await bootstrapRes.json();
            await cacheFieldBootstrap(data);

            const cardPlayerIds = new Set(
              (data.cardTokens as Array<{ playerId: string }>).map((card) => card.playerId),
            );
            const attendanceMap = new Map(
              (data.attendance as Array<{ playerId: string; status: AttendanceStatus; method: string }>).map(
                (row) => [row.playerId, row],
              ),
            );

            applySetup({
              session: {
                id: sessionId,
                teamId: data.session.teamId,
                teamName,
                scheduledStart: data.session.scheduledStart,
                scheduledEnd: data.session.scheduledEnd ?? undefined,
                location: data.session.location ?? undefined,
                status: data.session.status,
                sessionType: data.session.sessionType,
                sessionDate,
              },
              roster: (data.players as Array<{ id: string; nickname: string; fullName: string; jerseyNumber?: number | null }>).map(
                (player) => ({
                  id: player.id,
                  nickname: player.nickname,
                  fullName: player.fullName,
                  jerseyNumber: player.jerseyNumber ?? null,
                  hasCard: cardPlayerIds.has(player.id),
                  status: attendanceMap.get(player.id)?.status ?? null,
                  method: (attendanceMap.get(player.id)?.method as AttendanceSetupPlayer['method']) ?? null,
                }),
              ),
              cardTokens: data.cardTokens,
            });
            return;
          }
        }

        const cached = await loadCachedAttendanceSetup(sessionId);
        if (cached) {
          applySetup({ ...cached, session: { ...cached.session, teamName: cached.session.teamName || teamName } }, true);
          return;
        }

        setFlash({
          type: 'error',
          message: 'Data absensi belum tersimpan di HP. Sambungkan internet lalu buka halaman ini sekali.',
        });
      } catch {
        const cached = await loadCachedAttendanceSetup(sessionId);
        if (cached) {
          applySetup(cached, true);
        } else {
          setFlash({
            type: 'error',
            message: 'Gagal memuat data sesi. Periksa koneksi lalu muat ulang.',
          });
        }
      }
    }

    void load();
  }, [applySetup, sessionDate, sessionId, teamName]);

  const updatePlayer = useCallback(
    (playerId: string, status: AttendanceStatus | null, method: AttendanceSetupPlayer['method']) => {
      setRoster((current) =>
        current.map((player) =>
          player.id === playerId
            ? { ...player, status, method: status ? method : null }
            : player,
        ),
      );
    },
    [],
  );

  const saveStatus = useCallback(
    async (playerId: string, status: AttendanceStatus, method: 'qr' | 'manual') => {
      const previous = rosterMap.get(playerId);
      setSavingPlayerId(playerId);
      updatePlayer(playerId, status, method);

      try {
        await markAttendanceLocal({
          sessionId,
          playerId,
          sessionDate,
          status,
          method,
          recordedBy: coachId,
        });

        if (!navigator.onLine) {
          setOfflineOnly(true);
        }

        if (method === 'qr' && status === 'present') {
          const nickname = rosterMap.get(playerId)?.nickname ?? 'Pemain';
          setFlash({ type: 'success', message: `${nickname} hadir` });
          setTimeout(() => setFlash(null), 1200);
        }

        return true;
      } catch {
        if (previous) {
          updatePlayer(playerId, previous.status, previous.method);
        } else {
          updatePlayer(playerId, null, null);
        }
        setFlash({
          type: 'error',
          message: 'Gagal mencatat absensi. Coba lagi.',
        });
        return false;
      } finally {
        setSavingPlayerId(null);
      }
    },
    [coachId, rosterMap, sessionDate, sessionId, updatePlayer],
  );

  const handleScan = useCallback(
    async (token: string) => {
      const card = await db.cardTokens.get(token);
      if (!card) {
        setFlash({
          type: 'error',
          message: 'Kartu tidak dikenali. Periksa kartu atau tandai manual.',
        });
        return;
      }

      const player = rosterMap.get(card.playerId);
      if (!player) {
        setFlash({ type: 'error', message: 'Pemain tidak terdaftar di kelas sesi ini.' });
        return;
      }

      if (isPresentStatus(player.status)) {
        setFlash({
          type: 'info',
          message: `${player.nickname} sudah tercatat ${statusLabel(player.status).toLowerCase()}.`,
        });
        return;
      }

      await saveStatus(player.id, 'present', 'qr');
    },
    [rosterMap, saveStatus],
  );

  const handleManualToggle = useCallback(
    async (playerId: string) => {
      const player = rosterMap.get(playerId);
      if (!player) return;

      const nextStatus = nextManualStatus(player.status);
      if (!nextStatus) {
        setFlash({
          type: 'info',
          message: 'Untuk menghapus absensi, hubungi admin.',
        });
        return;
      }

      await saveStatus(playerId, nextStatus, 'manual');
    },
    [rosterMap, saveStatus],
  );

  const handleScanError = useCallback((message: string) => {
    setFlash({ type: 'error', message });
  }, []);

  const manualPlayers = roster.filter(
    (player) => !player.hasCard || !isPresentStatus(player.status),
  );

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="space-y-1 px-4 pb-3 pt-4">
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-3)]">
          {teamName}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Absensi</h1>
        {offlineOnly && (
          <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-field-text-2)]">
            Perubahan tersimpan di HP dan akan dikirim saat online.
          </p>
        )}
      </header>

      <div className="flex-1 space-y-4 px-4 pb-4">
        <section className="flex items-end justify-between rounded-[var(--radius-card)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] px-4 py-3">
          <StatNumber
            value={presentCount}
            suffix={`/ ${roster.length}`}
            label="Hadir"
            size="large"
            theme="field"
          />
        </section>

        {ready ? (
          <QrScanner onScan={handleScan} onError={handleScanError} />
        ) : (
          <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-panel)] bg-[var(--color-field-raised)]" />
        )}

        {flash && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-[var(--radius-panel)] px-4 py-3 text-sm font-[family-name:var(--font-ui)]',
              flash.type === 'success' && 'bg-[var(--color-made)]/15 text-[var(--color-made)]',
              flash.type === 'error' && 'bg-[var(--color-miss)]/15 text-[var(--color-miss)]',
              flash.type === 'info' && 'bg-[var(--color-field-raised)] text-[var(--color-field-text-2)]',
            )}
            role="status"
            aria-live="polite"
          >
            {flash.type === 'success' ? (
              <CheckCircle size={20} weight="fill" />
            ) : (
              <WarningCircle size={20} weight="fill" />
            )}
            {flash.message}
          </div>
        )}

        <section className="space-y-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Tanpa kartu / belum scan
            </h2>
            <p className="mt-1 text-sm text-[var(--color-field-text-3)]">
              Ketuk nama untuk tandai hadir, terlambat, atau absen.
            </p>
          </div>

          {manualPlayers.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] px-4 py-6 text-center text-sm text-[var(--color-field-text-2)]">
              Semua pemain sudah tercatat.
            </div>
          ) : (
            <ul className="space-y-2">
              {manualPlayers.map((player) => (
                <li key={player.id}>
                  <button
                    type="button"
                    onClick={() => void handleManualToggle(player.id)}
                    disabled={savingPlayerId === player.id}
                    className={cn(
                      'flex min-h-[var(--size-touch-min)] w-full items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors',
                      'border-[var(--color-field-border)] bg-[var(--color-field-raised)]',
                      'hover:border-[var(--color-leather)]/40 active:scale-[0.99]',
                      savingPlayerId === player.id && 'opacity-60',
                    )}
                  >
                    <UserCircle
                      size={28}
                      weight="duotone"
                      className="shrink-0 text-[var(--color-field-text-3)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold">
                        {player.nickname}
                      </p>
                      <p className="truncate text-sm text-[var(--color-field-text-3)]">
                        {player.jerseyNumber != null ? `#${player.jerseyNumber}` : 'Tanpa nomor'}
                        {!player.hasCard ? ' · belum punya kartu' : ''}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-[var(--radius-chip)] border px-3 py-1 text-xs font-semibold',
                        statusClass(player.status),
                      )}
                    >
                      {statusLabel(player.status)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="border-t border-[var(--color-field-border)] p-4">
        <Link href={`/session/${sessionId}/stations`} className="block w-full">
          <Button variant="primary" size="field" className="w-full">
            Lanjut ke pos
            <ArrowRight size={20} weight="bold" />
          </Button>
        </Link>
      </footer>
    </div>
  );
}
