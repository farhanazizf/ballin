import { db } from '@/lib/db';

export interface PlayerDrillCounts {
  made: number;
  attempts: number;
  isDnp: boolean;
}

export function aggregateEvents(
  events: Array<{ result: 'made' | 'miss' | 'dnp'; voidedAt?: string }>
): PlayerDrillCounts {
  const active = events.filter((e) => !e.voidedAt);
  const made = active.filter((e) => e.result === 'made').length;
  const miss = active.filter((e) => e.result === 'miss').length;
  const isDnp = active.some((e) => e.result === 'dnp') && made + miss === 0;

  return { made, attempts: made + miss, isDnp };
}

export async function loadPlayerCounts(
  sessionDrillId: string,
  playerId: string
): Promise<PlayerDrillCounts> {
  const events = await db.localEvents
    .where({ sessionDrillId, playerId })
    .toArray();

  return aggregateEvents(events);
}
