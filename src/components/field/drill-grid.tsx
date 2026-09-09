'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayerDrillCard } from '@/components/field/player-drill-card';
import { loadPlayerCounts, type PlayerDrillCounts } from '@/lib/field/drill-counts';
import { undoLastRep } from '@/lib/sync/record-rep';
import { useTranslations } from '@/lib/i18n/use-translations';

export type DrillGridPlayer = {
  id: string;
  nickname: string;
  jerseyNumber?: number | null;
};

export function DrillGrid({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  target,
  trackMisses = false,
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  target?: number;
  trackMisses?: boolean;
}) {
  const { t } = useTranslations();
  const labels = t.field.drillGrid;
  const [counts, setCounts] = useState<Record<string, PlayerDrillCounts> | null>(null);
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);
  const [epoch, setEpoch] = useState(0);

  const refresh = useCallback(async () => {
    const next: Record<string, PlayerDrillCounts> = {};
    await Promise.all(
      players.map(async (player) => {
        next[player.id] = await loadPlayerCounts(sessionDrillId, player.id);
      }),
    );
    setCounts(next);
  }, [players, sessionDrillId]);

  useEffect(() => {
    void refresh();
  }, [refresh, epoch]);

  async function handleUndo() {
    if (!lastPlayerId) return;
    await undoLastRep(sessionDrillId, lastPlayerId);
    setEpoch((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-field-text)]">
            {drillName}
          </h1>
          {target != null && (
            <p className="text-sm text-[var(--color-field-text-3)] font-[family-name:var(--font-ui)]">
              {labels.targetReps.replace('{target}', String(target))}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          data-testid="drill-undo"
          onClick={() => void handleUndo()}
          disabled={!lastPlayerId}
        >
          {labels.undo}
        </Button>
      </header>

      {!counts ? (
        <p className="text-sm text-[var(--color-field-text-3)]">{t.field.drill.preparing}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {players.map((player) => {
            const playerCounts = counts[player.id] ?? { made: 0, attempts: 0, isDnp: false };
            return (
              <PlayerDrillCard
                key={`${player.id}-${epoch}`}
                playerId={player.id}
                nickname={player.nickname}
                sessionDrillId={sessionDrillId}
                recordedBy={recordedBy}
                trackMisses={trackMisses}
                initialMade={playerCounts.made}
                initialAttempts={playerCounts.attempts}
                initialDnp={playerCounts.isDnp}
                onRecorded={() => setLastPlayerId(player.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
