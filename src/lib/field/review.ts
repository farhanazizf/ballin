import { db } from '@/lib/db';
import { aggregateEvents, type PlayerDrillCounts } from '@/lib/field/drill-counts';
import { enqueue } from '@/lib/sync/outbox';
import { syncResultSchema, type SyncResult } from '@/lib/validators/sync';

export type ReviewPlayerRow = {
  playerId: string;
  nickname: string;
  jerseyNumber?: number;
  made: number;
  attempts: number;
  isDnp: boolean;
  needsConfirm: boolean;
  hasConflict: boolean;
  overridden: boolean;
};

export type ReviewDrillSection = {
  sessionDrillId: string;
  drillId: string;
  drillName: string;
  target?: number;
  players: ReviewPlayerRow[];
};

export function mergeCounts(
  base: PlayerDrillCounts,
  override?: { made: number; attempts: number; isDnp: boolean } | null,
): PlayerDrillCounts {
  if (!override) return base;
  return {
    made: override.made,
    attempts: override.attempts,
    isDnp: override.isDnp,
  };
}

export function needsConfirmation(counts: PlayerDrillCounts): boolean {
  return !counts.isDnp && counts.attempts === 0;
}

export function hasRecorderConflict(
  events: Array<{ recordedBy: string; voidedAt?: string }>,
): boolean {
  const recorders = new Set(
    events.filter((event) => !event.voidedAt).map((event) => event.recordedBy),
  );
  return recorders.size > 1;
}

export async function loadSessionReview(sessionId: string): Promise<ReviewDrillSection[]> {
  const [sessionDrills, players] = await Promise.all([
    db.sessionDrills.where('sessionId').equals(sessionId).toArray(),
    db.players.toArray(),
  ]);

  const sections: ReviewDrillSection[] = [];

  for (const sessionDrill of sessionDrills) {
    const drill = await db.drills.get(sessionDrill.drillId);
    const playerRows: ReviewPlayerRow[] = [];

    for (const player of players) {
      const [events, override] = await Promise.all([
        db.localEvents
          .where({ sessionDrillId: sessionDrill.id, playerId: player.id })
          .toArray(),
        db.reviewOverrides.get(`${sessionDrill.id}:${player.id}`),
      ]);

      const counts = mergeCounts(
        aggregateEvents(events),
        override
          ? { made: override.made, attempts: override.attempts, isDnp: override.isDnp }
          : null,
      );

      playerRows.push({
        playerId: player.id,
        nickname: player.nickname,
        jerseyNumber: player.jerseyNumber,
        made: counts.made,
        attempts: counts.attempts,
        isDnp: counts.isDnp,
        needsConfirm: needsConfirmation(counts),
        hasConflict: hasRecorderConflict(events),
        overridden: Boolean(override),
      });
    }

    playerRows.sort((a, b) => a.nickname.localeCompare(b.nickname, 'id'));

    sections.push({
      sessionDrillId: sessionDrill.id,
      drillId: sessionDrill.drillId,
      drillName: drill?.name ?? 'Drill',
      target: sessionDrill.target,
      players: playerRows,
    });
  }

  return sections.sort((a, b) => a.drillName.localeCompare(b.drillName, 'id'));
}

export async function saveReviewOverride(
  input: SyncResult,
  recordedBy: string,
): Promise<{ ok: true } | { error: string }> {
  const parsed = syncResultSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data review tidak valid.' };
  }

  const data = parsed.data;
  const key = `${data.sessionDrillId}:${data.playerId}`;
  const updatedAt = new Date().toISOString();

  await db.reviewOverrides.put({
    key,
    sessionDrillId: data.sessionDrillId,
    playerId: data.playerId,
    made: data.made,
    attempts: data.attempts,
    isDnp: data.isDnp,
    updatedAt,
    recordedBy,
  });

  await enqueue({
    clientEventId: crypto.randomUUID(),
    table: 'drill_results',
    payload: {
      sessionDrillId: data.sessionDrillId,
      playerId: data.playerId,
      made: data.made,
      attempts: data.attempts,
      isDnp: data.isDnp,
      updatedAt,
      recordedBy,
    },
  });

  return { ok: true };
}

export async function saveReviewOverrides(
  overrides: SyncResult[],
  recordedBy: string,
): Promise<{ saved: number; errors: string[] }> {
  const errors: string[] = [];
  let saved = 0;

  for (const override of overrides) {
    const result = await saveReviewOverride(override, recordedBy);
    if ('error' in result) {
      errors.push(result.error);
    } else {
      saved += 1;
    }
  }

  return { saved, errors };
}
