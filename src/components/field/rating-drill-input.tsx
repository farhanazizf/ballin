'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';
import { db } from '@/lib/db';
import type { DrillGridPlayer } from '@/components/field/drill-grid';
import { cn } from '@/lib/utils';

const SCORES = [1, 2, 3, 4, 5] as const;

export function RatingDrillInput({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
}) {
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next: Record<string, number | undefined> = {};
    for (const player of players) {
      const events = await db.localEvents
        .where({ sessionDrillId, playerId: player.id })
        .filter((e) => !e.voidedAt && e.result === 'made')
        .toArray();
      next[player.id] = events.at(-1)?.value;
    }
    setValues(next);
  }, [sessionDrillId, players]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function rate(playerId: string, score: number) {
    await recordRep({ sessionDrillId, playerId, result: 'made', value: score, recordedBy });
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
          <p className="text-sm text-[var(--color-field-text-3)]">Skala 1–5</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleUndo()} disabled={!lastPlayerId}>
          Undo
        </Button>
      </header>

      <ul className="space-y-3">
        {players.map((player) => (
          <li
            key={player.id}
            className="rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] p-3"
          >
            <p className="mb-2 font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
              {player.nickname}
              {values[player.id] != null && (
                <span className="ml-2 text-sm text-[var(--color-phosphor)]">{values[player.id]}/5</span>
              )}
            </p>
            <div className="grid grid-cols-5 gap-1">
              {SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => void rate(player.id, score)}
                  className={cn(
                    'min-h-10 text-sm font-semibold',
                    values[player.id] === score
                      ? 'bg-[var(--color-phosphor)]/20 text-[var(--color-phosphor)]'
                      : 'bg-[var(--color-field-raised)] text-[var(--color-field-text-2)]',
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
