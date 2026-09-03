'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { QrScanner } from '@/components/field/qr-scanner';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';
import { db } from '@/lib/db';
import { markAttendanceLocal, isPlayerCheckedIn } from '@/lib/sync/record-attendance';
import { Button } from '@/components/ui/button';

type PlayerRow = { id: string; nickname: string; jerseyNumber?: number | null };

type Flash = { type: 'success' | 'error' | 'info'; message: string; player?: string };

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
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<Flash | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        setFlash({ type: 'error', message: 'Gagal memuat data sesi. Periksa koneksi lalu muat ulang.' });
        return;
      }
      const data = await res.json();
      await cacheFieldBootstrap(data);
      setPlayers(
        data.players.map((p: { id: string; nickname: string; jerseyNumber?: number | null }) => ({
          id: p.id,
          nickname: p.nickname,
          jerseyNumber: p.jerseyNumber,
        })),
      );
      const present = new Set<string>();
      for (const p of data.players as { id: string }[]) {
        if (await isPlayerCheckedIn(sessionId, p.id)) present.add(p.id);
      }
      setCheckedIn(present);
      setReady(true);
    }
    void load();
  }, [sessionId]);

  const presentCount = checkedIn.size;

  const handleScan = useCallback(
    async (token: string) => {
      const card = await db.cardTokens.get(token);
      if (!card) {
        setFlash({
          type: 'error',
          message: 'Kartu tidak dikenali. Pastikan kartu Ballin Dynasty dan belum dicabut.',
        });
        return;
      }

      const player = players.find((p) => p.id === card.playerId);
      if (!player) {
        setFlash({ type: 'error', message: 'Pemain tidak terdaftar di kelas sesi ini.' });
        return;
      }

      if (checkedIn.has(player.id)) {
        setFlash({ type: 'info', message: `${player.nickname} sudah tercatat hadir.`, player: player.nickname });
        return;
      }

      await markAttendanceLocal({
        sessionId,
        playerId: player.id,
        sessionDate,
        status: 'present',
        method: 'qr',
        recordedBy: coachId,
      });

      setCheckedIn((prev) => new Set(prev).add(player.id));
      setFlash({ type: 'success', message: `${player.nickname} hadir`, player: player.nickname });
      setTimeout(() => setFlash(null), 1200);
    },
    [checkedIn, coachId, players, sessionDate, sessionId],
  );

  const handleScanError = useCallback((message: string) => {
    setFlash({ type: 'error', message });
  }, []);

  const rosterList = useMemo(
    () =>
      [...players].sort((a, b) => {
        const aIn = checkedIn.has(a.id);
        const bIn = checkedIn.has(b.id);
        if (aIn !== bIn) return aIn ? 1 : -1;
        return a.nickname.localeCompare(b.nickname, 'id');
      }),
    [players, checkedIn],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="px-4 py-3 border-b border-[var(--color-field-border)] flex items-center gap-3">
        <Link href="/sessions" className="text-[var(--color-field-text-3)]">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-field-text)] truncate">
            Absensi · {teamName}
          </h1>
          <p className="text-xs text-[var(--color-field-text-3)] font-[family-name:var(--font-ui)]">
            {presentCount}/{players.length} hadir
          </p>
        </div>
      </header>

      <div className="p-4 space-y-4 flex-1">
        {ready ? (
          <QrScanner onScan={handleScan} onError={handleScanError} />
        ) : (
          <div className="aspect-[4/3] rounded-[var(--radius-panel)] bg-[var(--color-field-raised)] animate-pulse" />
        )}

        {flash && (
          <div
            className={cn(
              'rounded-[var(--radius-panel)] px-4 py-3 flex items-center gap-2 text-sm font-[family-name:var(--font-ui)]',
              flash.type === 'success' && 'bg-[var(--color-made)]/15 text-[var(--color-made)]',
              flash.type === 'error' && 'bg-[var(--color-miss)]/15 text-[var(--color-miss)]',
              flash.type === 'info' && 'bg-[var(--color-field-raised)] text-[var(--color-field-text-2)]',
            )}
          >
            {flash.type === 'success' ? <CheckCircle size={20} weight="fill" /> : <WarningCircle size={20} />}
            {flash.message}
          </div>
        )}

        <ul className="grid grid-cols-2 gap-2">
          {rosterList.map((player) => {
            const present = checkedIn.has(player.id);
            return (
              <li
                key={player.id}
                className={cn(
                  'rounded-[var(--radius-panel)] px-3 py-2.5 border min-h-[var(--size-touch-min)]',
                  'font-[family-name:var(--font-ui)] text-sm',
                  present
                    ? 'border-[var(--color-made)]/30 bg-[var(--color-made)]/10 text-[var(--color-field-text)]'
                    : 'border-[var(--color-field-border)] bg-[var(--color-field-surface)] text-[var(--color-field-text-2)]',
                )}
              >
                <span className="font-semibold">{player.nickname}</span>
                {player.jerseyNumber != null && (
                  <span className="ml-1 text-[var(--color-field-text-3)]">#{player.jerseyNumber}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="p-4 border-t border-[var(--color-field-border)]">
        <Link href={`/session/${sessionId}/stations`}>
          <Button variant="primary" size="field" className="w-full">
            Lanjut ke pos
          </Button>
        </Link>
      </footer>
    </div>
  );
}
