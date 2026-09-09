'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { StatNumber } from '@/components/ui/stat-number';
import { useTranslations } from '@/lib/i18n/use-translations';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUpItem, staggerContainer, tapTransition } from '@/lib/motion/presets';

export type DrillGridPlayer = {
  id: string;
  nickname: string;
  jerseyNumber?: number | null;
};

type PlayerCounts = { made: number; attempts: number; dnp: boolean };

function usePlayerCounts(sessionDrillId: string, playerIds: string[]) {
  const [counts, setCounts] = useState<Record<string, PlayerCounts>>({});

  const refresh = useCallback(async () => {
    const next: Record<string, PlayerCounts> = {};
    for (const playerId of playerIds) {
      const events = await db.localEvents
        .where({ sessionDrillId, playerId })
        .filter((e) => !e.voidedAt)
        .toArray();
      const dnp = events.some((e) => e.result === 'dnp');
      const made = events.filter((e) => e.result === 'made').length;
      const attempts = events.filter((e) => e.result === 'made' || e.result === 'miss').length;
      next[playerId] = { made, attempts, dnp };
    }
    setCounts(next);
  }, [sessionDrillId, playerIds]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { counts, refresh };
}

const PlayerCard = memo(function PlayerCard({
  player,
  counts,
  onMade,
  onMiss,
  onDnp,
  labels,
}: {
  player: DrillGridPlayer;
  counts: PlayerCounts;
  onMade: () => void;
  onMiss: () => void;
  onDnp: () => void;
  labels: {
    dnp: string;
    made: string;
    miss: string;
    dnpButton: string;
  };
}) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-panel)] border p-3 flex flex-col gap-2',
        'min-h-[var(--size-touch-primary)]',
        counts.dnp
          ? 'border-[var(--color-field-border)] bg-[var(--color-field-raised)] opacity-60'
          : 'border-[var(--color-field-border)] bg-[var(--color-field-surface)]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)] truncate">
          {player.nickname}
        </span>
        {player.jerseyNumber != null && (
          <span className="text-xs text-[var(--color-field-text-3)] tabular-nums">#{player.jerseyNumber}</span>
        )}
      </div>
      {counts.dnp ? (
        <p className="text-xs text-[var(--color-field-text-3)] font-[family-name:var(--font-ui)]">{labels.dnp}</p>
      ) : (
        <div data-testid={`drill-count-${player.id}`}>
          <StatNumber
            value={counts.made}
            suffix={counts.attempts > 0 ? `/${counts.attempts}` : undefined}
            size="card"
            theme="field"
          />
        </div>
      )}
      {!counts.dnp && (
        <div className="grid grid-cols-3 gap-1.5">
          <motion.button
            type="button"
            data-testid={`drill-made-${player.id}`}
            onClick={onMade}
            whileTap={{ scale: 0.96 }}
            transition={tapTransition}
            className={cn(
              'h-10 rounded-none text-sm font-semibold font-[family-name:var(--font-ui)]',
              'bg-[var(--color-made)]/20 text-[var(--color-made)]',
            )}
          >
            {labels.made}
          </motion.button>
          <button
            type="button"
            onClick={onMiss}
            className={cn(
              'h-10 rounded-none text-sm font-semibold font-[family-name:var(--font-ui)]',
              'bg-[var(--color-miss)]/15 text-[var(--color-miss)] active:scale-[0.97]',
            )}
          >
            {labels.miss}
          </button>
          <button
            type="button"
            onClick={onDnp}
            className={cn(
              'h-10 rounded-none text-xs font-medium font-mono uppercase tracking-[0.06em]',
              'bg-[var(--color-field-raised)] text-[var(--color-field-text-3)] active:scale-[0.97]',
            )}
          >
            {labels.dnpButton}
          </button>
        </div>
      )}
    </div>
  );
});


function DrillGridList({
  players,
  counts,
  labels,
  onTap,
}: {
  players: DrillGridPlayer[];
  counts: Record<string, PlayerCounts>;
  labels: {
    dnp: string;
    made: string;
    miss: string;
    dnpButton: string;
  };
  onTap: (playerId: string, result: 'made' | 'miss' | 'dnp') => void;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            counts={counts[player.id] ?? { made: 0, attempts: 0, dnp: false }}
            labels={labels}
            onMade={() => onTap(player.id, 'made')}
            onMiss={() => onTap(player.id, 'miss')}
            onDnp={() => onTap(player.id, 'dnp')}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 gap-2"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {players.map((player) => (
        <motion.div key={player.id} variants={fadeUpItem}>
          <PlayerCard
            player={player}
            counts={counts[player.id] ?? { made: 0, attempts: 0, dnp: false }}
            labels={labels}
            onMade={() => onTap(player.id, 'made')}
            onMiss={() => onTap(player.id, 'miss')}
            onDnp={() => onTap(player.id, 'dnp')}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function DrillGrid({
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  target,
}: {
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  target?: number;
}) {
  const { t } = useTranslations();
  const playerIds = players.map((p) => p.id);
  const { counts, refresh } = usePlayerCounts(sessionDrillId, playerIds);
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);

  async function tap(playerId: string, result: 'made' | 'miss' | 'dnp') {
    await recordRep({ sessionDrillId, playerId, result, recordedBy });
    setLastPlayerId(playerId);
    await refresh();
  }

  async function handleUndo() {
    if (!lastPlayerId) return;
    await undoLastRep(sessionDrillId, lastPlayerId);
    await refresh();
  }

  const labels = t.field.drillGrid;

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
        <Button variant="secondary" size="sm" data-testid="drill-undo" onClick={handleUndo} disabled={!lastPlayerId}>
          {labels.undo}
        </Button>
      </header>

      <DrillGridList players={players} counts={counts} labels={labels} onTap={tap} />
    </div>
  );
}
