import type { SupabaseClient } from '@supabase/supabase-js';

export type UpcomingSession = {
  id: string;
  scheduledStart: string;
  scheduledEnd: string | null;
  location: string | null;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  teamName: string;
  teamId: string;
};

export type WeeklyAttendanceWeek = {
  week: string;
  present: number;
  total: number;
  value: number;
};

export type WeeklyAttendance = {
  present: number;
  total: number;
  pct: number;
  trend: number;
  weekly: WeeklyAttendanceWeek[];
};

export type AttentionPlayer = {
  id: string;
  name: string;
  reason: string;
};

export type DrillDistributionItem = {
  category: string;
  count: number;
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function pct(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export async function getUpcomingSession(
  supabase: SupabaseClient,
  orgId: string,
): Promise<UpcomingSession | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: coachTeams } = await supabase
    .from('coach_teams')
    .select('team_id')
    .eq('coach_id', user.id);

  const teamIds = (coachTeams ?? []).map((row) => row.team_id as string);
  if (teamIds.length === 0) return null;

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_start, scheduled_end, location, status, team_id')
    .eq('organization_id', orgId)
    .in('team_id', teamIds)
    .in('status', ['scheduled', 'active'])
    .order('scheduled_start', { ascending: true })
    .limit(1);

  const session = sessions?.[0];
  if (!session) return null;

  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', session.team_id)
    .maybeSingle();

  return {
    id: session.id,
    scheduledStart: session.scheduled_start,
    scheduledEnd: session.scheduled_end,
    location: session.location,
    status: session.status,
    teamName: team?.name ?? '',
    teamId: session.team_id,
  };
}

export async function getWeeklyAttendance(
  supabase: SupabaseClient,
  orgId: string,
  teamIds: string[],
): Promise<WeeklyAttendance> {
  const emptyWeeks: WeeklyAttendanceWeek[] = [
    { week: 'W1', present: 0, total: 0, value: 0 },
    { week: 'W2', present: 0, total: 0, value: 0 },
    { week: 'W3', present: 0, total: 0, value: 0 },
    { week: 'W4', present: 0, total: 0, value: 0 },
  ];

  if (teamIds.length === 0) {
    return { present: 0, total: 0, pct: 0, trend: 0, weekly: emptyWeeks };
  }

  const currentWeekStart = startOfWeek(new Date());
  const weeks = Array.from({ length: 4 }, (_, index) => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - (3 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { label: `W${index + 1}`, start, end };
  });

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_start')
    .eq('organization_id', orgId)
    .in('team_id', teamIds)
    .in('status', ['completed', 'active'])
    .gte('scheduled_start', weeks[0].start.toISOString())
    .lt('scheduled_start', weeks[3].end.toISOString());

  const sessionWeekMap = new Map<string, number>();
  for (const session of sessions ?? []) {
    const sessionDate = new Date(session.scheduled_start);
    const weekIndex = weeks.findIndex(
      (week) => sessionDate >= week.start && sessionDate < week.end,
    );
    if (weekIndex >= 0) {
      sessionWeekMap.set(session.id, weekIndex);
    }
  }

  const sessionIds = [...sessionWeekMap.keys()];
  const weekStats = weeks.map(() => ({ present: 0, total: 0 }));

  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from('attendance')
      .select('session_id, status')
      .in('session_id', sessionIds);

    for (const row of attendance ?? []) {
      const weekIndex = sessionWeekMap.get(row.session_id);
      if (weekIndex === undefined) continue;
      weekStats[weekIndex].total += 1;
      if (row.status === 'present' || row.status === 'late') {
        weekStats[weekIndex].present += 1;
      }
    }
  }

  const weekly = weeks.map((week, index) => ({
    week: week.label,
    present: weekStats[index].present,
    total: weekStats[index].total,
    value: pct(weekStats[index].present, weekStats[index].total),
  }));

  const current = weekly[3];
  const previous = weekly[2];

  return {
    present: current.present,
    total: current.total,
    pct: current.value,
    trend: current.value - previous.value,
    weekly,
  };
}

export async function getAttentionPlayers(
  supabase: SupabaseClient,
  orgId: string,
): Promise<AttentionPlayer[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let teamIds: string[] = [];
  if (user) {
    const { data: coachTeams } = await supabase
      .from('coach_teams')
      .select('team_id')
      .eq('coach_id', user.id);
    teamIds = (coachTeams ?? []).map((row) => row.team_id as string);
  }

  let playerIds: string[] = [];
  if (teamIds.length > 0) {
    const { data: teamPlayers } = await supabase
      .from('team_players')
      .select('player_id')
      .in('team_id', teamIds)
      .is('left_at', null);
    playerIds = [...new Set((teamPlayers ?? []).map((row) => row.player_id as string))];
  } else {
    const { data: players } = await supabase
      .from('players')
      .select('id')
      .eq('organization_id', orgId)
      .eq('status', 'active');
    playerIds = (players ?? []).map((row) => row.id as string);
  }

  if (playerIds.length === 0) return [];

  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('organization_id', orgId)
    .in('status', ['completed', 'active'])
    .order('scheduled_start', { ascending: false })
    .limit(8);

  const sessionIds = (recentSessions ?? []).map((row) => row.id as string);
  if (sessionIds.length === 0) return [];

  const { data: attendance } = await supabase
    .from('attendance')
    .select('player_id, status')
    .in('session_id', sessionIds)
    .in('player_id', playerIds);

  const { data: players } = await supabase
    .from('players')
    .select('id, nickname, full_name')
    .in('id', playerIds);

  const playerNames = new Map(
    (players ?? []).map((player) => [
      player.id as string,
      (player.nickname || player.full_name) as string,
    ]),
  );

  const absentCount = new Map<string, number>();
  const presentCount = new Map<string, number>();
  const totalCount = new Map<string, number>();

  for (const row of attendance ?? []) {
    const playerId = row.player_id as string;
    totalCount.set(playerId, (totalCount.get(playerId) ?? 0) + 1);
    if (row.status === 'absent') {
      absentCount.set(playerId, (absentCount.get(playerId) ?? 0) + 1);
    }
    if (row.status === 'present' || row.status === 'late') {
      presentCount.set(playerId, (presentCount.get(playerId) ?? 0) + 1);
    }
  }

  const results: AttentionPlayer[] = [];

  for (const playerId of playerIds) {
    const absences = absentCount.get(playerId) ?? 0;
    const total = totalCount.get(playerId) ?? 0;
    const present = presentCount.get(playerId) ?? 0;
    const name = playerNames.get(playerId) ?? 'Pemain';

    if (absences >= 3) {
      results.push({
        id: playerId,
        name,
        reason: `Tidak hadir ${absences} kali dalam ${sessionIds.length} latihan terakhir`,
      });
      continue;
    }

    if (total >= 2 && present / total < 0.5) {
      results.push({
        id: playerId,
        name,
        reason: `Kehadiran rendah (${pct(present, total)}%) dalam latihan terakhir`,
      });
    }
  }

  return results.slice(0, 5);
}

export async function getDrillDistribution(
  supabase: SupabaseClient,
  orgId: string,
  month: Date,
): Promise<DrillDistributionItem[]> {
  const start = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString();

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id')
    .eq('organization_id', orgId)
    .gte('scheduled_start', start)
    .lt('scheduled_start', end);

  const sessionIds = (sessions ?? []).map((row) => row.id as string);
  if (sessionIds.length === 0) return [];

  const { data: sessionDrills } = await supabase
    .from('session_drills')
    .select('drill_id')
    .in('session_id', sessionIds);

  const drillIds = [...new Set((sessionDrills ?? []).map((row) => row.drill_id as string))];
  if (drillIds.length === 0) return [];

  const { data: drills } = await supabase
    .from('drills')
    .select('id, category')
    .in('id', drillIds);

  const categoryByDrillId = new Map(
    (drills ?? []).map((drill) => [drill.id as string, drill.category as string]),
  );

  const categoryCount = new Map<string, number>();
  for (const row of sessionDrills ?? []) {
    const category = categoryByDrillId.get(row.drill_id as string);
    if (!category) continue;
    categoryCount.set(category, (categoryCount.get(category) ?? 0) + 1);
  }

  return [...categoryCount.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getCoachTeamIds(
  supabase: SupabaseClient,
  coachId: string,
): Promise<string[]> {
  const { data: coachTeams } = await supabase
    .from('coach_teams')
    .select('team_id')
    .eq('coach_id', coachId);

  return (coachTeams ?? []).map((row) => row.team_id as string);
}
