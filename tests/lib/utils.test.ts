import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateAge, formatDate, formatTime } from '@/lib/utils';

describe('calculateAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-03T12:00:00+07:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates age before birthday this year', () => {
    expect(calculateAge('2012-03-15')).toBe(14);
  });

  it('calculates age after birthday this year', () => {
    expect(calculateAge('2012-01-01')).toBe(14);
  });
});

describe('formatDate', () => {
  it('formats to Indonesian locale', () => {
    const formatted = formatDate('2026-08-28');
    expect(formatted).toContain('2026');
    expect(formatted.toLowerCase()).toMatch(/agu/);
  });
});

describe('formatTime', () => {
  it('formats to 24-hour HH:MM', () => {
    expect(formatTime('2026-09-03T16:30:00+07:00')).toMatch(/16\.30|16:30/);
  });
});
