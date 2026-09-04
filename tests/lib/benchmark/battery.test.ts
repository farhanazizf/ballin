import { describe, expect, it } from 'vitest';
import { BENCHMARK_BATTERY, sessionTypeLabel } from '@/lib/benchmark/battery';

describe('benchmark battery', () => {
  it('memuat minimal 5 drill terkurasi', () => {
    expect(BENCHMARK_BATTERY.length).toBeGreaterThanOrEqual(5);
  });

  it('menandai label benchmark', () => {
    expect(sessionTypeLabel('benchmark')).toBe('Benchmark');
    expect(sessionTypeLabel('training')).toBe('Latihan');
  });
});
