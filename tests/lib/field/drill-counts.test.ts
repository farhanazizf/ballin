import { describe, expect, it } from 'vitest';
import { aggregateEvents } from '@/lib/field/drill-counts';

describe('aggregateEvents', () => {
  it('counts made and attempts from active events', () => {
    expect(
      aggregateEvents([
        { result: 'made' },
        { result: 'made' },
        { result: 'miss' },
      ])
    ).toEqual({ made: 2, attempts: 3, isDnp: false });
  });

  it('ignores voided events', () => {
    expect(
      aggregateEvents([
        { result: 'made' },
        { result: 'made', voidedAt: '2026-09-03T10:00:00.000Z' },
      ])
    ).toEqual({ made: 1, attempts: 1, isDnp: false });
  });

  it('marks dnp when only dnp events exist', () => {
    expect(aggregateEvents([{ result: 'dnp' }])).toEqual({
      made: 0,
      attempts: 0,
      isDnp: true,
    });
  });

  it('does not mark dnp when player has reps', () => {
    expect(
      aggregateEvents([{ result: 'dnp' }, { result: 'made' }])
    ).toEqual({ made: 1, attempts: 1, isDnp: false });
  });
});
