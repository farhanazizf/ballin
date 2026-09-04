import { describe, expect, it } from 'vitest';
import {
  buildRecurringSessionStarts,
  wibLocalDateTimeToIso,
} from '@/lib/sessions/recurrence';

describe('buildRecurringSessionStarts', () => {
  it('generates Tue and Thu sessions for two weeks', () => {
    const starts = buildRecurringSessionStarts({
      daysOfWeek: [2, 4],
      startTime: '16:00',
      horizonWeeks: 2,
      anchorDateKey: '2026-09-01',
    });

    expect(starts.length).toBe(4);
    expect(starts[0]).toBe(wibLocalDateTimeToIso('2026-09-01', '16:00'));
    expect(starts[1]).toBe(wibLocalDateTimeToIso('2026-09-03', '16:00'));
  });

  it('returns empty when no days selected', () => {
    expect(
      buildRecurringSessionStarts({
        daysOfWeek: [],
        startTime: '16:00',
        horizonWeeks: 4,
      }),
    ).toEqual([]);
  });
});
