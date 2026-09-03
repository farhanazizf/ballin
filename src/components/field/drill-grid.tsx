'use client';

import { PlayerDrillCard } from './player-drill-card';
import type { PlayerDrillCounts } from '@/lib/field/drill-counts';

export interface DrillGridPlayer {
  id: string;
  nickname: string;
  counts: PlayerDrillCounts;
}

export interface DrillGridProps {
  sessionDrillId: string;
  recordedBy: string;
  trackMisses: boolean;
  players: DrillGridPlayer[];
}

export function DrillGrid({
  sessionDrillId,
  recordedBy,
  trackMisses,
  players,
}: DrillGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-3 pb-6">
      {players.map((player) => (
        <PlayerDrillCard
          key={player.id}
          playerId={player.id}
          nickname={player.nickname}
          sessionDrillId={sessionDrillId}
          recordedBy={recordedBy}
          trackMisses={trackMisses}
          initialMade={player.counts.made}
          initialAttempts={player.counts.attempts}
          initialDnp={player.counts.isDnp}
        />
      ))}
    </div>
  );
}
