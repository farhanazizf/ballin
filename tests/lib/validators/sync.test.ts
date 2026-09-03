import { describe, expect, it } from 'vitest';
import { syncEventSchema, syncEventsBatchSchema } from '@/lib/validators/sync';

const validEvent = {
  clientEventId: '10000000-0000-4000-8000-000000000001',
  sessionDrillId: '50000000-0000-4000-8000-000000000001',
  playerId: '30000000-0000-4000-8000-000000000001',
  result: 'made' as const,
  occurredAt: '2026-09-03T10:00:00.000Z',
  deviceId: 'device-abc123',
  recordedBy: '20000000-0000-4000-8000-000000000001',
};

describe('syncEventSchema', () => {
  it('accepts a valid drill event payload', () => {
    expect(syncEventSchema.safeParse(validEvent).success).toBe(true);
  });

  it('rejects invalid clientEventId', () => {
    expect(
      syncEventSchema.safeParse({ ...validEvent, clientEventId: 'not-a-uuid' }).success
    ).toBe(false);
  });

  it('rejects empty deviceId', () => {
    expect(syncEventSchema.safeParse({ ...validEvent, deviceId: '' }).success).toBe(false);
  });
});

describe('syncEventsBatchSchema', () => {
  it('accepts a batch with one or more events', () => {
    expect(syncEventsBatchSchema.safeParse({ events: [validEvent] }).success).toBe(true);
  });

  it('rejects empty batch', () => {
    expect(syncEventsBatchSchema.safeParse({ events: [] }).success).toBe(false);
  });

  it('rejects batch over 50 events', () => {
    expect(
      syncEventsBatchSchema.safeParse({ events: Array(51).fill(validEvent) }).success
    ).toBe(false);
  });
});
