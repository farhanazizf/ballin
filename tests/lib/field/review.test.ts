import { describe, expect, it } from 'vitest';
import {
  hasRecorderConflict,
  mergeCounts,
  needsConfirmation,
} from '@/lib/field/review';

describe('review helpers', () => {
  it('flags zero attempts for confirmation when not dnp', () => {
    expect(needsConfirmation({ made: 0, attempts: 0, isDnp: false })).toBe(true);
    expect(needsConfirmation({ made: 0, attempts: 0, isDnp: true })).toBe(false);
    expect(needsConfirmation({ made: 2, attempts: 3, isDnp: false })).toBe(false);
  });

  it('merges override over aggregated counts', () => {
    expect(
      mergeCounts({ made: 2, attempts: 4, isDnp: false }, { made: 5, attempts: 8, isDnp: false }),
    ).toEqual({ made: 5, attempts: 8, isDnp: false });
  });

  it('detects multi-coach conflict', () => {
    expect(
      hasRecorderConflict([
        { recordedBy: 'coach-a' },
        { recordedBy: 'coach-b' },
      ]),
    ).toBe(true);
    expect(hasRecorderConflict([{ recordedBy: 'coach-a' }])).toBe(false);
    expect(
      hasRecorderConflict([
        { recordedBy: 'coach-a', voidedAt: '2026-09-03T10:00:00.000Z' },
        { recordedBy: 'coach-b' },
      ]),
    ).toBe(false);
  });
});
