export type BenchmarkDrillSpec = {
  name: string;
  target?: number;
};

/** Drill terkurasi benchmark — nama harus match baris di tabel drills. */
export const BENCHMARK_BATTERY: BenchmarkDrillSpec[] = [
  { name: 'Sprint 3/4 lapangan' },
  { name: 'Defensive slide (lane agility)' },
  { name: 'Beep test' },
  { name: 'Vertical jump' },
  { name: 'Free throw', target: 25 },
  { name: 'Spot shooting 5 titik' },
];

export function sessionTypeLabel(sessionType: string): string {
  return sessionType === 'benchmark' ? 'Benchmark' : 'Latihan';
}
