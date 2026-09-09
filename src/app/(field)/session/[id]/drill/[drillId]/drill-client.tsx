'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react';
import { cacheFieldBootstrap, loadCachedFieldBootstrap, type FieldBootstrapPayload } from '@/lib/field/bootstrap';
import { DrillInputShell, type DrillType } from '@/components/field/drill-input-shell';
import type { DrillGridPlayer } from '@/components/field/drill-grid';
import { ensureSessionDrill } from '@/lib/sync/record-session-drill';
import { findLocalSessionDrill } from '@/lib/field/session-drill';
import { useTranslations } from '@/lib/i18n/use-translations';

function rosterFromBootstrap(
  data: FieldBootstrapPayload,
  stationId: string | null,
): DrillGridPlayer[] {
  let roster: DrillGridPlayer[] = data.players.map((player) => ({
    id: player.id,
    nickname: player.nickname,
    jerseyNumber: player.jerseyNumber,
  }));

  if (stationId) {
    const station = data.stations.find((row) => row.id === stationId);
    if (station) {
      const allowed = new Set(station.playerIds);
      roster = roster.filter((player) => allowed.has(player.id));
    }
  }

  return roster;
}

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
  const [trackMisses, setTrackMisses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backHref = useMemo(() => `/session/${sessionId}/stations`, [sessionId]);

  useEffect(() => {
    async function load() {
      try {
        let data: FieldBootstrapPayload | null = null;

        try {
          const bootstrapRes = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
            credentials: 'include',
          });
          if (bootstrapRes.ok) {
            data = (await bootstrapRes.json()) as FieldBootstrapPayload;
            await cacheFieldBootstrap(data);
          }
        } catch {
          data = null;
        }

        if (!data) {
          data = await loadCachedFieldBootstrap(sessionId);
        }

        if (!data) {
          setError(d.offlineCacheMissing);
          return;
        }

        setPlayers(rosterFromBootstrap(data, stationId));

        const drill = data.drills.find((row) => row.id === drillId);
        setDrillName(drill?.name ?? d.defaultName);
        setDrillType((drill?.type as DrillType) ?? 'attempt');
        setTarget(drill?.defaultTarget ?? undefined);
        setUnit(drill?.unit ?? undefined);
        setLowerIsBetter(Boolean(drill?.lowerIsBetter));

        const existing = findLocalSessionDrill(data.sessionDrills, drillId, stationId);
        if (existing) {
          setSessionDrillId(existing.id);
          setTrackMisses(existing.trackMisses);
          if (existing.target != null) setTarget(existing.target);
          return;
        }

        const sd = await ensureSessionDrill({
          sessionId,
          drillId,
          stationId: stationId ?? undefined,
          recordedBy: coachId,
          target: drill?.defaultTarget ?? undefined,
          trackMisses: false,
        });
        setSessionDrillId(sd.id);
        setTrackMisses(sd.trackMisses);
        if (sd.target != null) setTarget(sd.target);
      } catch {
        setError(d.setupRetry);
      }
    }

    void load();
  }, [coachId, d.defaultName, d.offlineCacheMissing, d.setupRetry, drillId, sessionId, stationId]);

  if (error) {
    return <p className="p-4 text-[var(--color-miss)] font-[family-name:var(--font-ui)]">{error}</p>;
  }

  if (!sessionDrillId) {
    return <div className="p-4 animate-pulse text-[var(--color-field-text-3)]">{d.preparing}</div>;
  }

  return (
    <div className="min-h-[100dvh] p-4" data-testid="drill-input-screen">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-field-text-3)]"
      >
        <ArrowLeft size={16} />
        {t.common.back}
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
        trackMisses={trackMisses}
      />
      <div className="mt-6">
        <Link
          href={`/session/${sessionId}/review`}
          className="inline-flex min-h-[var(--size-touch-min)] items-center justify-center border-2 border-[var(--color-field-border)] px-4 font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--color-field-text-2)] hover:border-[var(--color-phosphor)] hover:text-[var(--color-phosphor)]"
        >
          {t.field.stations.reviewSession}
        </Link>
      </div>
    </div>
  );
}
