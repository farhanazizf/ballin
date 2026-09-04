import type { SupabaseClient } from '@supabase/supabase-js';
import {
  sessionSchema,
  recurringSessionSchema,
  sessionCancelSchema,
  type SessionInput,
  type RecurringSessionInput,
  type SessionCancelInput,
} from '@/lib/validators/session';
import { buildRecurringSessionStarts } from '@/lib/sessions/recurrence';
import { getCoachTeamIds } from '@/lib/queries/dashboard';

export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export type SessionListItem = {
  id: string;
  scheduledStart: string;
  scheduledEnd: string | null;
  location: string | null;
  status: SessionStatus;
  sessionType: string;
  teamName: string;
  teamId: string;
  attendanceCount: number;
  rosterCount: number;
};

export type TeamOption = {
  id: string;
  name: string;
  trackDrillStats: boolean;
};

export type SessionDateGroup = {
  dateKey: string;
  dateLabel: string;
  sessions: SessionListItem[];
};

const WIB_TIMEZONE = 'Asia/Jakarta';

export function getDateKeyWib(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: WIB_TIMEZONE }).format(
    new Date(iso),
  );
}

export function formatDateGroupLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatSessionTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: WIB_TIMEZONE,
  }).format(new Date(iso));
}

export function sessionStatusLabel(status: SessionStatus): string {
  switch (status) {
    case 'active':
      return 'Sedang berlangsung';
    case 'scheduled':
      return 'Belum dimulai';
    case 'completed':
      return 'Selesai';
    case 'cancelled':
      return 'Dibatalkan';
  }
}

export function groupSessionsByDate(sessions: SessionListItem[]): SessionDateGroup[] {
  const groups = new Map<string, SessionListItem[]>();

  for (const session of sessions) {
    const dateKey = getDateKeyWib(session.scheduledStart);
    const existing = groups.get(dateKey) ?? [];
    existing.push(session);
    groups.set(dateKey, existing);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, dateSessions]) => ({
      dateKey,
      dateLabel: formatDateGroupLabel(dateKey),
      sessions: dateSessions.sort(
        (a, b) =>
          new Date(b.scheduledStart).getTime() -
          new Date(a.scheduledStart).getTime(),
      ),
    }));
}

export async function getSessionsForCoach(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
): Promise<SessionListItem[]> {
  const teamIds = await getCoachTeamIds(supabase, coachId);
  if (teamIds.length === 0) return [];
  return getSessionsList(supabase, orgId, teamIds);
}

export async function createSession(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  rawInput: SessionInput,
): Promise<{ id: string } | { error: string }> {
  const parsed = sessionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: 'Data sesi tidak valid. Periksa kelas dan waktu mulai.' };
  }

  const input = parsed.data;
  const teamIds = await getCoachTeamIds(supabase, coachId);
  if (teamIds.length > 0 && !teamIds.includes(input.teamId)) {
    return {
      error: 'Kelas tidak ditemukan atau Anda belum ditugaskan ke kelas ini.',
    };
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      organization_id: orgId,
      team_id: input.teamId,
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd ?? null,
      location: input.location ?? null,
      session_type: input.sessionType,
      status: 'scheduled',
    })
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Gagal menyimpan sesi. Coba lagi dalam beberapa saat.' };
  }

  return { id: data.id };
}

export async function getTeamsForCoach(
  supabase: SupabaseClient,
  orgId: string,
  coachTeamIds: string[],
): Promise<TeamOption[]> {
  let query = supabase
    .from('teams')
    .select('id, name, track_drill_stats')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('name');

  if (coachTeamIds.length > 0) {
    query = query.in('id', coachTeamIds);
  }

  const { data } = await query;
  return (data ?? []).map((t) => ({
    id: t.id as string,
    name: t.name as string,
    trackDrillStats: t.track_drill_stats as boolean,
  }));
}

export async function getSessionsList(
  supabase: SupabaseClient,
  orgId: string,
  coachTeamIds: string[],
): Promise<SessionListItem[]> {
  let query = supabase
    .from('sessions')
    .select('id, scheduled_start, scheduled_end, location, status, session_type, team_id')
    .eq('organization_id', orgId)
    .order('scheduled_start', { ascending: false })
    .limit(30);

  if (coachTeamIds.length > 0) {
    query = query.in('team_id', coachTeamIds);
  }

  const { data: sessions } = await query;
  if (!sessions?.length) return [];

  const teamIds = [...new Set(sessions.map((s) => s.team_id as string))];
  const sessionIds = sessions.map((s) => s.id as string);

  const [{ data: teams }, { data: attendance }, { data: roster }] = await Promise.all([
    supabase.from('teams').select('id, name').in('id', teamIds),
    supabase.from('attendance').select('session_id').in('session_id', sessionIds),
    supabase.from('team_players').select('team_id, player_id, left_at').in('team_id', teamIds),
  ]);

  const teamNameMap = new Map((teams ?? []).map((t) => [t.id as string, t.name as string]));
  const attendanceCount = new Map<string, number>();
  for (const row of attendance ?? []) {
    const sid = row.session_id as string;
    attendanceCount.set(sid, (attendanceCount.get(sid) ?? 0) + 1);
  }

  const rosterCountByTeam = new Map<string, number>();
  for (const row of roster ?? []) {
    if (row.left_at) continue;
    const tid = row.team_id as string;
    rosterCountByTeam.set(tid, (rosterCountByTeam.get(tid) ?? 0) + 1);
  }

  return sessions.map((s) => ({
    id: s.id as string,
    scheduledStart: s.scheduled_start as string,
    scheduledEnd: s.scheduled_end as string | null,
    location: s.location as string | null,
    status: s.status as SessionListItem['status'],
    sessionType: s.session_type as string,
    teamName: teamNameMap.get(s.team_id as string) ?? '',
    teamId: s.team_id as string,
    attendanceCount: attendanceCount.get(s.id as string) ?? 0,
    rosterCount: rosterCountByTeam.get(s.team_id as string) ?? 0,
  }));
}

export async function getSessionById(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<SessionListItem | null> {
  const { data: session } = await supabase
    .from('sessions')
    .select('id, scheduled_start, scheduled_end, location, status, session_type, team_id, organization_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) return null;

  const { data: team } = await supabase
    .from('teams')
    .select('name, track_drill_stats')
    .eq('id', session.team_id)
    .maybeSingle();

  const [{ count: attendanceCount }, { count: rosterCount }] = await Promise.all([
    supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId),
    supabase
      .from('team_players')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', session.team_id)
      .is('left_at', null),
  ]);

  return {
    id: session.id,
    scheduledStart: session.scheduled_start,
    scheduledEnd: session.scheduled_end,
    location: session.location,
    status: session.status,
    sessionType: session.session_type,
    teamName: team?.name ?? '',
    teamId: session.team_id,
    attendanceCount: attendanceCount ?? 0,
    rosterCount: rosterCount ?? 0,
  };
}

export async function createRecurringSchedule(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  rawInput: RecurringSessionInput,
): Promise<{ scheduleId: string; sessionCount: number } | { error: string }> {
  const parsed = recurringSessionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: 'Data jadwal tidak valid. Periksa kelas, hari, dan waktu.' };
  }

  const input = parsed.data;
  const teamIds = await getCoachTeamIds(supabase, coachId);
  if (teamIds.length > 0 && !teamIds.includes(input.teamId)) {
    return {
      error: 'Kelas tidak ditemukan atau Anda belum ditugaskan ke kelas ini.',
    };
  }

  const starts = buildRecurringSessionStarts({
    daysOfWeek: input.daysOfWeek,
    startTime: input.startTime,
    horizonWeeks: input.horizonWeeks,
  });

  if (starts.length === 0) {
    return { error: 'Tidak ada sesi yang bisa dibuat dari jadwal ini.' };
  }

  const { data: schedule, error: scheduleError } = await supabase
    .from('session_schedules')
    .insert({
      organization_id: orgId,
      team_id: input.teamId,
      days_of_week: input.daysOfWeek,
      start_time: `${input.startTime}:00`,
      location: input.location ?? null,
      session_type: input.sessionType,
      horizon_weeks: input.horizonWeeks,
      created_by: coachId,
    })
    .select('id')
    .single();

  if (scheduleError || !schedule) {
    return { error: 'Gagal menyimpan jadwal berulang. Coba lagi.' };
  }

  const rows = starts.map((scheduledStart) => ({
    organization_id: orgId,
    team_id: input.teamId,
    scheduled_start: scheduledStart,
    location: input.location ?? null,
    session_type: input.sessionType,
    status: 'scheduled' as const,
    schedule_id: schedule.id,
  }));

  const { error: sessionsError } = await supabase.from('sessions').insert(rows);
  if (sessionsError) {
    await supabase.from('session_schedules').delete().eq('id', schedule.id);
    return { error: 'Gagal membuat sesi dari jadwal. Coba lagi.' };
  }

  return { scheduleId: schedule.id, sessionCount: rows.length };
}

export async function cancelSession(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  sessionId: string,
  rawInput: SessionCancelInput,
): Promise<{ ok: true } | { error: string }> {
  const parsed = sessionCancelSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: 'Alasan pembatalan wajib diisi.' };
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, team_id, organization_id, status')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session || session.organization_id !== orgId) {
    return { error: 'Sesi tidak ditemukan.' };
  }

  const teamIds = await getCoachTeamIds(supabase, coachId);
  if (teamIds.length > 0 && !teamIds.includes(session.team_id as string)) {
    return { error: 'Anda tidak ditugaskan ke kelas sesi ini.' };
  }

  if (session.status === 'cancelled') {
    return { ok: true };
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'cancelled',
      cancel_reason: parsed.data.cancelReason.trim(),
    })
    .eq('id', sessionId);

  if (error) {
    return { error: 'Gagal membatalkan sesi. Coba lagi.' };
  }

  return { ok: true };
}
