import { getSessionDate } from '@/lib/attendance/session-date';
import type { AttendanceSetupData } from '@/lib/attendance/types';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getAttendanceSetup(sessionId: string): Promise<AttendanceSetupData | null> {
  const supabase = await createServerSupabaseClient();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select(
      `
      id,
      team_id,
      scheduled_start,
      scheduled_end,
      location,
      status,
      session_type,
      teams!inner ( name )
    `,
    )
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError || !session) {
    return null;
  }

  const teamName =
    (session.teams as { name?: string } | null)?.name ?? 'Kelas';

  const [{ data: teamPlayers }, { data: attendanceRows }, { data: cards }] = await Promise.all([
    supabase
      .from('team_players')
      .select(
        `
        player_id,
        players!inner (
          id,
          nickname,
          full_name,
          jersey_number,
          status
        )
      `,
      )
      .eq('team_id', session.team_id)
      .is('left_at', null),
    supabase
      .from('attendance')
      .select('player_id, status, method')
      .eq('session_id', sessionId),
    supabase
      .from('player_cards')
      .select('token, player_id, issued_at')
      .is('revoked_at', null),
  ]);

  const attendanceMap = new Map(
    (attendanceRows ?? []).map((row) => [
      row.player_id,
      { status: row.status, method: row.method },
    ]),
  );

  const cardPlayerIds = new Set((cards ?? []).map((card) => card.player_id));

  const roster = (teamPlayers ?? [])
    .map((entry) => {
      const player = entry.players as {
        id: string;
        nickname: string;
        full_name: string;
        jersey_number: number | null;
        status: string;
      };

      if (player.status !== 'active') {
        return null;
      }

      const attendance = attendanceMap.get(player.id);

      return {
        id: player.id,
        nickname: player.nickname,
        fullName: player.full_name,
        jerseyNumber: player.jersey_number,
        hasCard: cardPlayerIds.has(player.id),
        status: attendance?.status ?? null,
        method: (attendance?.method as AttendanceSetupData['roster'][number]['method']) ?? null,
      };
    })
    .filter((player): player is AttendanceSetupData['roster'][number] => player !== null)
    .sort((a, b) => a.nickname.localeCompare(b.nickname, 'id'));

  const rosterIds = new Set(roster.map((player) => player.id));

  const cardTokens = (cards ?? [])
    .filter((card) => rosterIds.has(card.player_id))
    .map((card) => ({
      token: card.token,
      playerId: card.player_id,
      issuedAt: card.issued_at,
    }));

  return {
    session: {
      id: session.id,
      teamId: session.team_id,
      teamName,
      scheduledStart: session.scheduled_start,
      scheduledEnd: session.scheduled_end ?? undefined,
      location: session.location ?? undefined,
      status: session.status,
      sessionType: session.session_type,
      sessionDate: getSessionDate(session.scheduled_start),
    },
    roster,
    cardTokens,
  };
}
