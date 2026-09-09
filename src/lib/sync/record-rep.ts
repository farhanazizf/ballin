import { db } from '@/lib/db';
import { enqueue } from './outbox';
import { classifyUndoAction } from './undo-action';
import { ensurePresentFromDrill } from './record-attendance';

export interface RepInput {
  sessionDrillId: string;
  playerId: string;
  result: 'made' | 'miss' | 'dnp';
  value?: number;
  recordedBy: string;
}

let deviceId: string | null = null;

function getDeviceId(): string {
  if (deviceId) return deviceId;
  
  const stored = typeof window !== 'undefined' 
    ? localStorage.getItem('ballin_device_id') 
    : null;
  
  if (stored) {
    deviceId = stored;
    return stored;
  }
  
  const newId = crypto.randomUUID();
  if (typeof window !== 'undefined') {
    localStorage.setItem('ballin_device_id', newId);
  }
  deviceId = newId;
  return newId;
}

/**
 * Record a single rep event. This is the core action when coach taps a player card.
 * Writes locally first (instant), then queues for sync.
 * 
 * Must complete in < 100ms for UI responsiveness.
 */
export async function recordRep(input: RepInput) {
  const event = {
    clientEventId: crypto.randomUUID(),
    sessionDrillId: input.sessionDrillId,
    playerId: input.playerId,
    result: input.result,
    value: input.value,
    occurredAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    recordedBy: input.recordedBy,
  };

  await db.transaction('rw', db.localEvents, db.outbox, async () => {
    await db.localEvents.add(event);
    await enqueue({
      clientEventId: event.clientEventId,
      table: 'drill_events',
      payload: event,
    });
  });

  void ensurePresentFromDrill({
    sessionDrillId: input.sessionDrillId,
    playerId: input.playerId,
    recordedBy: input.recordedBy,
    result: input.result,
  });

  return event;
}

/**
 * Undo the last rep for a player in a drill.
 * If not yet synced: delete from local + outbox.
 * If already synced: send a void event.
 */
export async function undoLastRep(sessionDrillId: string, playerId: string) {
  const events = await db.localEvents
    .where({ sessionDrillId, playerId })
    .filter((e) => !e.voidedAt)
    .reverse()
    .first();

  if (!events) return null;

  // Check if already sent
  const outboxItem = await db.outbox
    .where('clientEventId')
    .equals(events.clientEventId)
    .first();

  if (classifyUndoAction(outboxItem?.status) === 'delete') {
    await db.transaction('rw', db.localEvents, db.outbox, async () => {
      await db.localEvents.delete(events.clientEventId);
      if (outboxItem?.seq) {
        await db.outbox.delete(outboxItem.seq);
      }
    });
  } else {
    const voidedAt = new Date().toISOString();
    await db.localEvents.update(events.clientEventId, { voidedAt });
    await enqueue({
      clientEventId: crypto.randomUUID(),
      table: 'drill_events_void',
      payload: {
        targetClientEventId: events.clientEventId,
        voidedAt,
      },
    });
  }

  return events;
}
