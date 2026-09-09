'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';
import { DrillInputShell, type DrillType } from '@/components/field/drill-input-shell';
import type { DrillGridPlayer } from '@/components/field/drill-grid';
import { db } from '@/lib/db';
import { useTranslations } from '@/lib/i18n/use-translations';

export function DrillClient({
  sessionId,
  drillId,
  coachId,
}: {
  sessionId: string;
  drillId: string;
  coachId: string;
}) {
  const { t } = useTranslations();
  const d = t.field.drill;
  const searchParams = useSearchParams();
  const stationId = searchParams.get('stationId');
  const [sessionDrillId, setSessionDrillId] = useState<string | null>(null);
  const [players, setPlayers] = useState<DrillGridPlayer[]>([]);
  const [drillName, setDrillName] = useState('');
  const [drillType, setDrillType] = useState<DrillType>('attempt');
  const [target, setTarget] = useState<number | undefined>();
  const [unit, setUnit] = useState<string | undefined>();
  const [lowerIsBetter, setLowerIsBetter] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backHref = useMemo(() => `/session/${sessionId}/stations`, [sessionId]);

  useEffect(() => {
    async function load() {
      try {
      const bootstrapRes = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      if (!bootstrapRes.ok) {
        setError(d.loadFailed);
        return;
      }
      const data = await bootstrapRes.json();
      await cacheFieldBootstrap(data);

      let roster: DrillGridPlayer[] = data.players.map((p: DrillGridPlayer) => ({
        id: p.id,
        nickname: p.nickname,
        jerseyNumber: p.jerseyNumber,
      }));

      if (stationId) {
        const station = (data.stations ?? []).find((s: { id: string }) => s.id === stationId);
        if (station) {
          const allowed = new Set(station.playerIds as string[]);
          roster = roster.filter((player) => allowed.has(player.id));
        }
      }

      setPlayers(roster);

      const drill = data.drills.find((d: { id: string }) => d.id === drillId);
      setDrillName(drill?.name ?? d.defaultName);
      setDrillType((drill?.type as DrillType) ?? 'attempt');
      setTarget(drill?.defaultTarget ?? undefined);
      setUnit(drill?.unit ?? undefined);
      setLowerIsBetter(Boolean(drill?.lowerIsBetter));

      type SessionDrillRow = {
        id: string;
        drillId: string;
        stationId?: string | null;
        target?: number | null;
        trackMisses: boolean;
        startedAt: string;
      };

      const existing = (data.sessionDrills as SessionDrillRow[]).find(
        (sd) => sd.drillId === drillId && (stationId ? sd.stationId === stationId : !sd.stationId),
      );

      if (existing) {
        setSessionDrillId(existing.id);
        await db.sessionDrills.put({
          id: existing.id,
          sessionId,
          stationId: stationId ?? undefined,
          drillId,
          target: existing.target ?? undefined,
          trackMisses: existing.trackMisses,
          startedAt: existing.startedAt,
        });
        return;
      }

      const sdRes = await fetch('/api/session-drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, drillId, stationId: stationId ?? undefined }),
      });
      if (!sdRes.ok) {
        setError(d.setupFailed);
        return;
      }
      const sd = await sdRes.json();
      setSessionDrillId(sd.id);
      await db.sessionDrills.put({
        id: sd.id,
        sessionId,
        stationId: stationId ?? undefined,
        drillId,
        target: sd.target ?? undefined,
        trackMisses: sd.trackMisses,
        startedAt: sd.startedAt,
      });
      } catch {
        setError(d.setupRetry);
      }
    }

    void load();
  }, [sessionId, drillId, stationId]);

  if (error) {
    return <p className="p-4 text-[var(--color-miss)] font-[family-name:var(--font-ui)]">{error}</p>;
  }

  if (!sessionDrillId) {
    return <div className="p-4 animate-pulse text-[var(--color-field-text-3)]">Menyiapkan drill...</div>;
  }

  return (
    <div className="min-h-[100dvh] p-4" data-testid="drill-input-screen">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-field-text-3)]"
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>
      <DrillInputShell
        drillType={drillType}
        sessionDrillId={sessionDrillId}
        players={players}
        recordedBy={coachId}
        drillName={drillName}
        target={target}
        unit={unit}
        lowerIsBetter={lowerIsBetter}
      />
      <div className="mt-6">
        <Link
          href={`/session/${sessionId}/review`}
          className="inline-flex min-h-[var(--size-touch-min)] items-center justify-center border-2 border-[var(--color-field-border)] px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-field-text-2)] hover:border-[var(--color-phosphor)] hover:text-[var(--color-phosphor)]"
        >
          Review hasil sesi
        </Link>
      </div>
    </div>
  );
}
