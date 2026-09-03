import { describe, expect, it } from 'vitest';
import { getBackoffMs } from '@/lib/sync/outbox';

describe('getBackoffMs', () => {
  it('doubles delay with each retry', () => {
    expect(getBackoffMs(0)).toBe(1000);
    expect(getBackoffMs(1)).toBe(2000);
    expect(getBackoffMs(2)).toBe(4000);
  });

  it('caps at 30 seconds', () => {
    expect(getBackoffMs(10)).toBe(30000);
    expect(getBackoffMs(20)).toBe(30000);
  });
});
