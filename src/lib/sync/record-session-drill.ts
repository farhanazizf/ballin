import { db } from '@/lib/db';
import { enqueue } from '@/lib/sync/outbox';
import { findLocalSessionDrill } from '@/lib/field/session-drill';

export async function ensureSessionDrill(input: {
  sessionId: string;
  drillId: string;
  stationId?: string;
  recordedBy: string;
  target?: number;
  trackMisses?: boolean;
}): Promise<{ id: string; trackMisses: boolean; target?: number; startedAt: string }> {
  const localRows = await db.sessionDrills.where('sessionId').equals(input.sessionId).toArray();
  const local = findLocalSessionDrill(localRows, input.drillId, input.stationId ?? null);
  if (local) {
    return {
      id: local.id,
      trackMisses: local.trackMisses,
      target: local.target,
      startedAt: local.startedAt,
    };
  }

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const res = await fetch('/api/session-drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: input.sessionId,
          drillId: input.drillId,
          stationId: input.stationId,
          target: input.target,
          trackMisses: input.trackMisses ?? false,
        }),
      });
      if (res.ok) {
        const sd = (await res.json()) as {
          id: string;
          target?: number | null;
          trackMisses: boolean;
          startedAt: string;
        };
        await db.sessionDrills.put({
          id: sd.id,
          sessionId: input.sessionId,
          stationId: input.stationId,
          drillId: input.drillId,
          target: sd.target ?? input.target,
          trackMisses: sd.trackMisses,
          startedAt: sd.startedAt,
        });
        return {
          id: sd.id,
          trackMisses: sd.trackMisses,
          target: sd.target ?? input.target,
          startedAt: sd.startedAt,
        };
      }
    } catch {
      // Fall through to local create when the GOR has no signal.
    }
  }

  const localId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const trackMisses = input.trackMisses ?? false;
  await db.transaction('rw', db.sessionDrills, db.outbox, async () => {
    await db.sessionDrills.put({
      id: localId,
      sessionId: input.sessionId,
      stationId: input.stationId,
      drillId: input.drillId,
      target: input.target,
      trackMisses,
      startedAt,
    });
    await enqueue({
      clientEventId: localId,
      table: 'session_drills',
      payload: {
        id: localId,
        sessionId: input.sessionId,
        drillId: input.drillId,
        stationId: input.stationId,
        target: input.target,
        trackMisses,
      },
    });
  });

  return { id: localId, trackMisses, target: input.target, startedAt };
}
