import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId wajib diisi.' }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, team_id, status, scheduled_start, scheduled_end, location, session_type, organization_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 });
  }

  const teamId = session.team_id as string;
  const orgId = session.organization_id as string;

  const [
    { data: teamPlayers },
    { data: cards },
    { data: drills },
    { data: sessionDrills },
    { data: attendance },
    { data: stations },
  ] = await Promise.all([
    supabase
      .from('team_players')
      .select('player_id, players ( id, nickname, full_name, jersey_number )')
      .eq('team_id', teamId)
      .is('left_at', null),
    supabase
      .from('player_cards')
      .select('token, player_id, issued_at')
      .eq('organization_id', orgId)
      .is('revoked_at', null),
    supabase
      .from('drills')
      .select('id, name, category, type, default_target, unit, lower_is_better, attribute_weights, instructions')
      .eq('organization_id', orgId)
      .eq('is_archived', false),
    supabase
      .from('session_drills')
      .select('id, session_id, station_id, drill_id, target, track_misses, started_at')
      .eq('session_id', sessionId),
    supabase
      .from('attendance')
      .select('player_id, status, session_date, method, checked_in_at')
      .eq('session_id', sessionId),
    supabase
      .from('session_stations')
      .select('id, label, coach_id, sort_order, station_players ( player_id )')
      .eq('session_id', sessionId)
      .order('sort_order'),
  ]);

  type TeamPlayerRow = {
    player_id: string;
    players: { id: string; nickname: string; full_name: string; jersey_number: number | null } | null;
  };

  type StationRow = {
    id: string;
    label: string;
    coach_id: string | null;
    sort_order: number;
    station_players: Array<{ player_id: string }> | null;
  };

  const players = ((teamPlayers ?? []) as TeamPlayerRow[])
    .filter((tp) => tp.players)
    .map((tp) => ({
      id: tp.players!.id,
      nickname: tp.players!.nickname,
      fullName: tp.players!.full_name,
      jerseyNumber: tp.players!.jersey_number,
      teamIds: [teamId],
    }));

  return NextResponse.json({
    session: {
      id: session.id,
      teamId,
      status: session.status,
      scheduledStart: session.scheduled_start,
      scheduledEnd: session.scheduled_end,
      location: session.location,
      sessionType: session.session_type,
    },
    players,
    cardTokens: (cards ?? []).map((c) => ({
      token: c.token as string,
      playerId: c.player_id as string,
      issuedAt: c.issued_at as string,
    })),
    drills: (drills ?? []).map((d) => ({
      id: d.id as string,
      name: d.name as string,
      category: d.category as string,
      type: d.type as string,
      defaultTarget: d.default_target as number | null,
      unit: d.unit as string | null,
      lowerIsBetter: d.lower_is_better as boolean,
      attributeWeights: (d.attribute_weights as Record<string, number>) ?? {},
      instructions: d.instructions as string | null,
    })),
    sessionDrills: (sessionDrills ?? []).map((sd) => ({
      id: sd.id as string,
      sessionId: sd.session_id as string,
      stationId: sd.station_id as string | null,
      drillId: sd.drill_id as string,
      target: sd.target as number | null,
      trackMisses: sd.track_misses as boolean,
      startedAt: sd.started_at as string,
    })),
    stations: ((stations ?? []) as StationRow[]).map((station) => ({
      id: station.id,
      label: station.label,
      coachId: station.coach_id,
      sortOrder: station.sort_order,
      playerIds: (station.station_players ?? []).map((row) => row.player_id),
    })),
    attendance: (attendance ?? []).map((a) => ({
      playerId: a.player_id as string,
      status: a.status as string,
      sessionDate: a.session_date as string,
      method: a.method as string,
      checkedInAt: a.checked_in_at as string | null,
    })),
  });
}
