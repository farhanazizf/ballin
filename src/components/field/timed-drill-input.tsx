'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';
import { db } from '@/lib/db';
import type { DrillGridPlayer } from '@/components/field/drill-grid';
import { cn } from '@/lib/utils';

function formatSeconds(totalMs: number) {
  const seconds = totalMs / 1000;
  return seconds.toFixed(2);
}

export function TimedDrillInput({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  unit = 'detik',
  lowerIsBetter = true,
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  unit?: string;
  lowerIsBetter?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    const next: Record<string, number | undefined> = {};
    for (const player of players) {
      const events = await db.localEvents
        .where({ sessionDrillId, playerId: player.id })
        .filter((e) => !e.voidedAt && e.result === 'made')
        .toArray();
      const latest = events.at(-1);
      next[player.id] = latest?.value;
    }
    setValues(next);
  }, [sessionDrillId, players]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!running) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    const tick = () => {
      if (startedAtRef.current != null) {
        setElapsedMs(Date.now() - startedAtRef.current);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [running]);

  function startTimer() {
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setRunning(true);
  }

  function stopTimer() {
    setRunning(false);
    startedAtRef.current = null;
  }

  async function recordLap(playerId: string) {
    if (!running) return;
    const value = elapsedMs / 1000;
    await recordRep({ sessionDrillId, playerId, result: 'made', value, recordedBy });
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
            {lowerIsBetter ? 'Lebih cepat lebih baik' : 'Lebih lama lebih baik'} · {unit}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleUndo()} disabled={!lastPlayerId}>
          Undo
        </Button>
      </header>

      <div className="rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] p-4 text-center">
        <p className="font-[family-name:var(--font-display)] text-[56px] font-bold tabular-nums text-[var(--color-field-text)]">{formatSeconds(elapsedMs)}</p>
        <div className="mt-4 flex gap-2">
          {!running ? (
            <Button className="flex-1" onClick={startTimer}>
              Mulai timer
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" onClick={stopTimer}>
              Stop timer
            </Button>
          )}
        </div>
      </div>

      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex min-h-[var(--size-touch-min)] items-center justify-between gap-3 rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] px-4"
          >
            <div>
              <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
                {player.nickname}
              </p>
              {values[player.id] != null && (
                <p className="text-xs text-[var(--color-field-text-3)] tabular-nums">
                  {values[player.id]!.toFixed(2)} {unit}
                </p>
              )}
            </div>
            <button
              type="button"
              disabled={!running}
              onClick={() => void recordLap(player.id)}
              className={cn(
                'min-h-10 min-w-[5.5rem] rounded-none px-3 text-sm font-semibold',
                running
                  ? 'bg-[var(--color-made)]/20 text-[var(--color-made)]'
                  : 'bg-[var(--color-field-raised)] text-[var(--color-field-text-3)]',
              )}
            >
              Catat
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
