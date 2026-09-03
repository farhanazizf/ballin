import { db, type OutboxItem } from '@/lib/db';

const BATCH_SIZE = 50;
const MAX_RETRIES = 10;
const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

/**
 * Add an item to the outbox for later sync
 */
export async function enqueue(item: Omit<OutboxItem, 'seq' | 'status' | 'retries' | 'createdAt'>) {
  await db.outbox.add({
    ...item,
    status: 'pending',
    retries: 0,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Process pending outbox items in batches
 */
export async function flush(): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  const pending = await db.outbox
    .where('status')
    .anyOf('pending', 'failed')
    .limit(BATCH_SIZE)
    .toArray();

  if (pending.length === 0) return { sent: 0, failed: 0 };

  // Mark as sending
  await db.outbox.bulkUpdate(
    pending.map((item) => ({
      key: item.seq!,
      changes: { status: 'sending' as const, lastAttempt: new Date().toISOString() },
    }))
  );

  try {
    // TODO: Implement actual batch send to Supabase
    // INSERT ... ON CONFLICT (client_event_id) DO NOTHING
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
    // Mark failed items with incremented retry count
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

/**
 * Calculate backoff delay for retries
 */
export function getBackoffMs(retries: number): number {
  return Math.min(BACKOFF_BASE_MS * Math.pow(2, retries), BACKOFF_MAX_MS);
}

/**
 * Placeholder for actual batch send
 */
async function sendBatch(_items: OutboxItem[]): Promise<{ ok: boolean; status: number }> {
  // Will be implemented with Supabase client
  // Uses: INSERT INTO drill_events ... ON CONFLICT (client_event_id) DO NOTHING
  return { ok: true, status: 200 };
}

/**
 * Get outbox status summary
 */
export async function getOutboxStatus() {
  const pending = await db.outbox.where('status').equals('pending').count();
  const sending = await db.outbox.where('status').equals('sending').count();
  const failed = await db.outbox.where('status').equals('failed').count();
  return { pending, sending, failed, total: pending + sending + failed };
}
