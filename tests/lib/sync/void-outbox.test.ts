import { describe, expect, it } from 'vitest';
import { groupOutboxItems, hasSyncableOutboxItems } from '@/lib/sync/outbox-group';
import { syncVoidEventsBatchSchema } from '@/lib/validators/sync';
import type { OutboxItem } from '@/lib/db';

function item(table: string): OutboxItem {
  return {
    clientEventId: '10000000-0000-4000-8000-000000000001',
    table,
    payload: {},
    status: 'pending',
    retries: 0,
    createdAt: '2026-09-09T00:00:00.000Z',
  };
}

describe('groupOutboxItems', () => {
  it('keeps void events as a syncable group instead of dropping them', () => {
    const groups = groupOutboxItems([item('drill_events_void')]);
    expect(groups.voids).toHaveLength(1);
    expect(hasSyncableOutboxItems(groups)).toBe(true);
  });

  it('returns empty when the batch has no known tables', () => {
    const groups = groupOutboxItems([item('unknown')]);
    expect(hasSyncableOutboxItems(groups)).toBe(false);
  });
});

describe('syncVoidEventsBatchSchema', () => {
  it('accepts a void batch keyed by client_event_id', () => {
    expect(
      syncVoidEventsBatchSchema.safeParse({
        voids: [
          {
            targetClientEventId: '10000000-0000-4000-8000-000000000001',
            voidedAt: '2026-09-09T10:00:00.000Z',
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects an empty void batch', () => {
    expect(syncVoidEventsBatchSchema.safeParse({ voids: [] }).success).toBe(false);
  });
});
