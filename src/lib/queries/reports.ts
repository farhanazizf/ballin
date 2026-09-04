import type { SupabaseClient } from '@supabase/supabase-js';
import { generateReportDraft, type ReportDraftContext } from '@/lib/ai/provider';
import type { ReportApproveInput, ReportContent, ReportGenerateInput } from '@/lib/validators/report';

export type ReportListItem = {
  id: string;
  playerId: string;
  playerName: string;
  periodStart: string;
  periodEnd: string;
  status: 'draft' | 'approved' | 'sent';
  hasPdf: boolean;
};

export async function getReportsForOrg(
  supabase: SupabaseClient,
  orgId: string,
): Promise<ReportListItem[]> {
  const { data: players } = await supabase
    .from('players')
    .select('id, nickname, full_name')
    .eq('organization_id', orgId)
    .eq('status', 'active');

  const playerIds = (players ?? []).map((p) => p.id as string);
  if (playerIds.length === 0) return [];

  const playerNames = new Map(
    (players ?? []).map((p) => [p.id as string, (p.nickname || p.full_name) as string]),
  );

  const { data: reports } = await supabase
    .from('reports')
    .select('id, player_id, period_start, period_end, status, pdf_path')
    .in('player_id', playerIds)
    .order('period_start', { ascending: false })
    .limit(50);

  return (reports ?? []).map((row) => ({
    id: row.id as string,
    playerId: row.player_id as string,
    playerName: playerNames.get(row.player_id as string) ?? 'Pemain',
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    status: row.status as ReportListItem['status'],
    hasPdf: Boolean(row.pdf_path),
  }));
}

async function buildReportContext(
  supabase: SupabaseClient,
  playerId: string,
  periodStart: string,
  periodEnd: string,
): Promise<ReportDraftContext | null> {
  const { data: player } = await supabase
    .from('players')
    .select('nickname, full_name')
    .eq('id', playerId)
    .maybeSingle();

  if (!player) return null;

  const [{ data: attendance }, { data: notes }, { data: rubric }] = await Promise.all([
    supabase
      .from('attendance')
      .select('status')
      .eq('player_id', playerId)
      .gte('session_date', periodStart)
      .lte('session_date', periodEnd),
    supabase
      .from('player_notes')
      .select('note')
      .eq('player_id', playerId)
      .gte('created_at', `${periodStart}T00:00:00Z`)
      .lte('created_at', `${periodEnd}T23:59:59Z`)
      .limit(5),
    supabase
      .from('rubric_scores')
      .select('effort, coachability, discipline')
      .eq('player_id', playerId)
      .gte('created_at', `${periodStart}T00:00:00Z`)
      .lte('created_at', `${periodEnd}T23:59:59Z`),
  ]);

  const records = attendance ?? [];
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const attendanceRate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  const rubricRows = rubric ?? [];
  const rubricSummary =
    rubricRows.length > 0
      ? `Effort rata-rata ${avg(rubricRows.map((r) => r.effort))}, coachability ${avg(rubricRows.map((r) => r.coachability))}, discipline ${avg(rubricRows.map((r) => r.discipline))}`
      : null;

  return {
    playerName: player.full_name as string,
    nickname: player.nickname as string,
    periodStart,
    periodEnd,
    attendanceRate,
    recentDrills: [],
    rubricSummary,
    notes: (notes ?? []).map((n) => n.note as string),
  };
}

function avg(values: Array<number | null>): string {
  const nums = values.filter((v): v is number => v != null);
  if (nums.length === 0) return '—';
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

export async function generateReport(
  supabase: SupabaseClient,
  orgId: string,
  input: ReportGenerateInput,
): Promise<{ id: string } | { error: string }> {
  const { data: player } = await supabase
    .from('players')
    .select('id, organization_id')
    .eq('id', input.playerId)
    .maybeSingle();

  if (!player || player.organization_id !== orgId) {
    return { error: 'Pemain tidak ditemukan.' };
  }

  const context = await buildReportContext(
    supabase,
    input.playerId,
    input.periodStart,
    input.periodEnd,
  );
  if (!context) return { error: 'Data pemain tidak lengkap untuk rapor.' };

  const draft = await generateReportDraft(context);

  const { data, error } = await supabase
    .from('reports')
    .upsert(
      {
        player_id: input.playerId,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        status: 'draft',
        ai_draft: draft,
        content: draft,
      },
      { onConflict: 'player_id,period_start' },
    )
    .select('id')
    .single();

  if (error || !data) return { error: 'Gagal menyimpan draf rapor. Coba lagi.' };
  return { id: data.id as string };
}

export async function approveReport(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  reportId: string,
  input: ReportApproveInput,
): Promise<{ ok: true } | { error: string }> {
  const { data: report } = await supabase
    .from('reports')
    .select('id, player_id, status')
    .eq('id', reportId)
    .maybeSingle();

  if (!report) return { error: 'Rapor tidak ditemukan.' };

  const { data: player } = await supabase
    .from('players')
    .select('organization_id')
    .eq('id', report.player_id)
    .maybeSingle();

  if (!player || player.organization_id !== orgId) {
    return { error: 'Rapor tidak ditemukan.' };
  }

  const { error } = await supabase
    .from('reports')
    .update({
      content: input.content,
      status: 'approved',
      approved_by: coachId,
      approved_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) return { error: 'Gagal menyetujui rapor. Coba lagi.' };
  return { ok: true };
}

export async function getReportById(
  supabase: SupabaseClient,
  reportId: string,
): Promise<{
  id: string;
  playerName: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  content: ReportContent;
} | null> {
  const { data: report } = await supabase
    .from('reports')
    .select('id, player_id, period_start, period_end, status, content')
    .eq('id', reportId)
    .maybeSingle();

  if (!report) return null;

  const { data: player } = await supabase
    .from('players')
    .select('nickname, full_name')
    .eq('id', report.player_id)
    .maybeSingle();

  return {
    id: report.id as string,
    playerName: (player?.nickname || player?.full_name) ?? 'Pemain',
    periodStart: report.period_start as string,
    periodEnd: report.period_end as string,
    status: report.status as string,
    content: report.content as ReportContent,
  };
}
