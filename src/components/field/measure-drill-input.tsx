'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';
import { db } from '@/lib/db';
import type { DrillGridPlayer } from '@/components/field/drill-grid';

export function MeasureDrillInput({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  unit = '',
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  unit?: string;
}) {
  const [values, setValues] = useState<Record<string, number | undefined>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
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

  async function saveValue(playerId: string) {
    const raw = draft[playerId]?.trim();
    if (!raw) return;
    const value = Number(raw.replace(',', '.'));
    if (Number.isNaN(value)) return;
    await recordRep({ sessionDrillId, playerId, result: 'made', value, recordedBy });
    setLastPlayerId(playerId);
    setDraft((prev) => ({ ...prev, [playerId]: '' }));
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
          {unit && <p className="text-sm text-[var(--color-field-text-3)]">Satuan: {unit}</p>}
        </div>
        <Button variant="secondary" size="sm" onClick={() => void handleUndo()} disabled={!lastPlayerId}>
          Undo
        </Button>
      </header>

      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-surface)] p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
                {player.nickname}
              </p>
              {values[player.id] != null && (
                <p className="text-sm tabular-nums text-[var(--color-phosphor)]">
                  {values[player.id]} {unit}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                inputMode="decimal"
                placeholder="Angka"
                value={draft[player.id] ?? ''}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [player.id]: event.target.value }))
                }
                className="min-h-[var(--size-touch-min)] flex-1 border border-[var(--color-field-border)] bg-[var(--color-terminal-bg)] px-3 font-mono text-sm text-[var(--color-field-text)]"
              />
              <Button size="sm" onClick={() => void saveValue(player.id)}>
                Simpan
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
