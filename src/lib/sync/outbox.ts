import { db, type OutboxItem } from '@/lib/db';

const BATCH_SIZE = 50;
const MAX_RETRIES = 10;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

export async function enqueue(item: Omit<OutboxItem, 'seq' | 'status' | 'retries' | 'createdAt'>) {
  await db.outbox.add({
    ...item,
    status: 'pending',
    retries: 0,
    createdAt: new Date().toISOString(),
  });
}

export async function flush(): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const pending = await db.outbox
    .where('status')
    .anyOf('pending', 'failed')
    .limit(BATCH_SIZE)
    .toArray();

  if (pending.length === 0) return { sent: 0, failed: 0 };

  await db.outbox.bulkUpdate(
    pending.map((item) => ({
      key: item.seq!,
      changes: { status: 'sending' as const, lastAttempt: new Date().toISOString() },
    }))
  );

  try {
    const response = await sendBatch(pending);

    if (response.ok) {
      await db.outbox.bulkUpdate(
        pending.map((item) => ({
          key: item.seq!,
          changes: { status: 'sent' as const },
        }))
      );
      sent = pending.length;
    } else {
      throw new Error(`Sync failed: ${response.status}`);
    }
  } catch (error) {
    await db.outbox.bulkUpdate(
      pending.map((item) => ({
        key: item.seq!,
        changes: {
          status: (item.retries >= MAX_RETRIES ? 'failed' : 'pending') as OutboxItem['status'],
          retries: item.retries + 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
    );
    failed = pending.length;
  }

  return { sent, failed };
}

export function getBackoffMs(retries: number): number {
  return Math.min(BACKOFF_BASE_MS * Math.pow(2, retries), BACKOFF_MAX_MS);
}

async function sendBatch(items: OutboxItem[]): Promise<{ ok: boolean; status: number }> {
  const drillEvents = items
    .filter((item) => item.table === 'drill_events')
    .map((item) => item.payload as {
      clientEventId: string;
      sessionDrillId: string;
      playerId: string;
      result: 'made' | 'miss' | 'dnp';
      value?: number;
      occurredAt: string;
      deviceId: string;
      recordedBy: string;
    });

  if (drillEvents.length === 0) {
    return { ok: true, status: 200 };
  }

  const res = await fetch('/api/sync/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ events: drillEvents }),
  });

  return { ok: res.ok, status: res.status };
}

export async function getOutboxStatus() {
  const pending = await db.outbox.where('status').equals('pending').count();
  const sending = await db.outbox.where('status').equals('sending').count();
  const failed = await db.outbox.where('status').equals('failed').count();
  return { pending, sending, failed, total: pending + sending + failed };
}
