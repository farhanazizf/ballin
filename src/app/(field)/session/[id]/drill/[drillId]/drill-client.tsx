'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';
import { DrillGrid, type DrillGridPlayer } from '@/components/field/drill-grid';
import { db } from '@/lib/db';

export function DrillClient({
  sessionId,
  drillId,
  coachId,
}: {
  sessionId: string;
  drillId: string;
  coachId: string;
}) {
  const [sessionDrillId, setSessionDrillId] = useState<string | null>(null);
  const [players, setPlayers] = useState<DrillGridPlayer[]>([]);
  const [drillName, setDrillName] = useState('');
  const [target, setTarget] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const bootstrapRes = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      if (!bootstrapRes.ok) {
        setError('Gagal memuat data sesi.');
        return;
      }
      const data = await bootstrapRes.json();
      await cacheFieldBootstrap(data);

      setPlayers(
        data.players.map((p: DrillGridPlayer) => ({
          id: p.id,
          nickname: p.nickname,
          jerseyNumber: p.jerseyNumber,
        })),
      );

      const drill = data.drills.find((d: { id: string }) => d.id === drillId);
      setDrillName(drill?.name ?? 'Drill');
      setTarget(drill?.defaultTarget ?? undefined);

      const existing = data.sessionDrills.find((sd: { drillId: string }) => sd.drillId === drillId);
      if (existing) {
        setSessionDrillId(existing.id);
        await db.sessionDrills.put({
          id: existing.id,
          sessionId,
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
        body: JSON.stringify({ sessionId, drillId }),
      });
      if (!sdRes.ok) {
        setError('Gagal menyiapkan drill sesi.');
        return;
      }
      const sd = await sdRes.json();
      setSessionDrillId(sd.id);
      await db.sessionDrills.put({
        id: sd.id,
        sessionId,
        drillId,
        target: sd.target ?? undefined,
        trackMisses: sd.trackMisses,
        startedAt: sd.startedAt,
      });
    }

    void load();
  }, [sessionId, drillId]);

  if (error) {
    return <p className="p-4 text-[var(--color-miss)] font-[family-name:var(--font-ui)]">{error}</p>;
  }

  if (!sessionDrillId) {
    return <div className="p-4 animate-pulse text-[var(--color-field-text-3)]">Menyiapkan drill...</div>;
  }

  return (
    <div className="min-h-[100dvh] p-4">
      <Link
        href={`/session/${sessionId}/stations`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-field-text-3)] mb-4"
      >
        <ArrowLeft size={16} />
        Kembali
      </Link>
      <DrillGrid
        sessionDrillId={sessionDrillId}
        players={players}
        recordedBy={coachId}
        drillName={drillName}
        target={target}
      />
    </div>
  );
}
