import { db, type OutboxItem } from '@/lib/db';
import { groupOutboxItems, hasSyncableOutboxItems } from '@/lib/sync/outbox-group';

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
  const groups = groupOutboxItems(items);

  if (!hasSyncableOutboxItems(groups)) {
    return { ok: true, status: 200 };
  }

  const requests: Promise<Response>[] = [];

  if (groups.drillEvents.length > 0) {
    requests.push(
      fetch('/api/sync/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          events: groups.drillEvents.map((item) => item.payload),
        }),
      }),
    );
  }

  if (groups.voids.length > 0) {
    requests.push(
      fetch('/api/sync/events/void', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          voids: groups.voids.map((item) => item.payload),
        }),
      }),
    );
  }

  if (groups.attendance.length > 0) {
    requests.push(
      fetch('/api/sync/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          records: groups.attendance.map((item) => item.payload),
        }),
      }),
    );
  }

  if (groups.drillResults.length > 0) {
    requests.push(
      fetch('/api/sync/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          results: groups.drillResults.map((item) => item.payload),
        }),
      }),
    );
  }

  for (const item of groups.sessionDrills) {
    const payload = item.payload as {
      id: string;
      sessionId: string;
      drillId: string;
      stationId?: string;
      target?: number;
      trackMisses?: boolean;
    };
    requests.push(
      fetch('/api/session-drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      }),
    );
  }

  const responses = await Promise.all(requests);
  const ok = responses.every((res) => res.ok);
  const status = responses.find((res) => !res.ok)?.status ?? 200;

  return { ok, status };
}

export async function getOutboxStatus() {
  const pending = await db.outbox.where('status').equals('pending').count();
  const sending = await db.outbox.where('status').equals('sending').count();
  const failed = await db.outbox.where('status').equals('failed').count();
  return { pending, sending, failed, total: pending + sending + failed };
}
