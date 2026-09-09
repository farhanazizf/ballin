'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatNumber } from '@/components/ui/stat-number';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';
import { db } from '@/lib/db';
import type { DrillGridPlayer } from '@/components/field/drill-grid';
import { cn } from '@/lib/utils';

export function CountInTimeDrillInput({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  durationSec,
  unit = 'repetisi',
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  durationSec: number;
  unit?: string;
}) {
  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const next: Record<string, number> = {};
    for (const player of players) {
      const events = await db.localEvents
        .where({ sessionDrillId, playerId: player.id })
        .filter((e) => !e.voidedAt && e.result === 'made')
        .toArray();
      next[player.id] = events.length;
    }
    setCounts(next);
  }, [sessionDrillId, players]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function startCountdown() {
    setRemaining(durationSec);
    setRunning(true);
  }

  async function tapMade(playerId: string) {
    if (!running) return;
    await recordRep({ sessionDrillId, playerId, result: 'made', recordedBy });
    setLastPlayerId(playerId);
    await refresh();
  }

  async function handleUndo() {
    if (!lastPlayerId) return;
    await undoLastRep(sessionDrillId, lastPlayerId);
    await refresh();
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-field-text)]">
            {drillName}
          </h1>
          <p className="text-sm text-[var(--color-field-text-3)]">
            Hitung {unit} dalam {durationSec} detik
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleUndo()} disabled={!lastPlayerId}>
          Urungkan
        </Button>
      </header>

      <div className="rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] p-4 text-center">
        <StatNumber value={remaining} size="giant" theme="field" />
        <div className="mt-4">
          {!running ? (
            <Button className="w-full" onClick={startCountdown}>
              Mulai {durationSec} detik
            </Button>
          ) : (
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--color-phosphor)]">
              Ketuk pemain setiap rep
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            disabled={!running}
            onClick={() => void tapMade(player.id)}
            className={cn(
              'rounded-[var(--radius-panel)] border p-3 text-left',
              running
                ? 'border-[var(--color-field-border)] bg-[var(--color-field-surface)] active:scale-[0.99]'
                : 'border-[var(--color-field-border)] bg-[var(--color-field-raised)] opacity-60',
            )}
          >
            <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
              {player.nickname}
            </p>
            <StatNumber value={counts[player.id] ?? 0} size="card" theme="field" />
          </button>
        ))}
      </div>
    </div>
  );
}
