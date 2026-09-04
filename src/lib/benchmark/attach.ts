import type { SupabaseClient } from '@supabase/supabase-js';
import { BENCHMARK_BATTERY } from '@/lib/benchmark/battery';

export async function attachBenchmarkBattery(
  supabase: SupabaseClient,
  orgId: string,
  sessionId: string,
  coachId: string,
): Promise<{ ok: true; drillCount: number } | { error: string }> {
  const names = BENCHMARK_BATTERY.map((item) => item.name);

  const { data: drills } = await supabase
    .from('drills')
    .select('id, name, default_target')
    .eq('organization_id', orgId)
    .eq('is_archived', false)
    .in('name', names);

  const drillByName = new Map((drills ?? []).map((row) => [row.name as string, row]));
  const missing = names.filter((name) => !drillByName.has(name));

  if (missing.length > 0) {
    return {
      error: `Drill benchmark belum tersedia: ${missing.join(', ')}. Tambahkan di pengaturan drill.`,
    };
  }

  const rows = BENCHMARK_BATTERY.map((spec) => {
    const drill = drillByName.get(spec.name)!;
    return {
      session_id: sessionId,
      drill_id: drill.id as string,
      target: spec.target ?? (drill.default_target as number | null) ?? null,
      track_misses: true,
      created_by: coachId,
    };
  });

  const { error } = await supabase.from('session_drills').insert(rows);
  if (error) {
    return { error: 'Gagal menambahkan drill benchmark ke sesi. Coba lagi.' };
  }

  return { ok: true, drillCount: rows.length };
}
