import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateAge } from '@/lib/utils';

export type PlayerListItem = {
  id: string;
  fullName: string;
  nickname: string;
  jerseyNumber: number | null;
  teamNames: string[];
};

export type GetPlayersOptions = {
  search?: string;
  teamId?: string;
};

export type PlayerDetail = {
  id: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  age: number | null;
  jerseyNumber: number | null;
  position: string | null;
  dominantHand: string | null;
  school: string | null;
  status: string;
  joinedAt: string;
  teamNames: string[];
  guardianName: string | null;
  guardianPhone: string | null;
  photoUrl: string | null;
  attributes: {
    shooting: number;
    finishing: number;
    ballhandling: number;
    defense: number;
    athleticism: number;
    attitude: number;
    archetype: string | null;
    periodStart: string;
    periodEnd: string;
  } | null;
  measurements: {
    measuredOn: string;
    heightCm: number | null;
    weightKg: number | null;
    wingspanCm: number | null;
    standingReachCm: number | null;
  } | null;
  attendanceRate: number;
  recentAbsences: number;
};

type TeamPlayerJoin = {
  team_id: string;
  left_at: string | null;
  teams: { id: string; name: string } | null;
};

function activeTeamNames(teamPlayers: TeamPlayerJoin[]): string[] {
  return teamPlayers
    .filter((tp) => !tp.left_at && tp.teams?.name)
    .map((tp) => tp.teams!.name);
}

function playerInCoachTeams(teamPlayers: TeamPlayerJoin[], coachTeamIds: Set<string>): boolean {
  if (coachTeamIds.size === 0) return true;
  return teamPlayers.some((tp) => !tp.left_at && coachTeamIds.has(tp.team_id));
}

function matchesSearch(player: PlayerListItem, search: string): boolean {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  return (
    player.nickname.toLowerCase().includes(q) ||
    player.fullName.toLowerCase().includes(q) ||
    player.teamNames.some((team) => team.toLowerCase().includes(q)) ||
    (player.jerseyNumber != null && String(player.jerseyNumber).includes(q))
  );
}

export async function getPlayersForOrg(
  supabase: SupabaseClient,
  orgId: string,
  coachTeamIds: string[],
  options: GetPlayersOptions = {},
): Promise<PlayerListItem[]> {
  const coachTeamSet = new Set(coachTeamIds);
  const { search, teamId } = options;

  if (teamId && coachTeamSet.size > 0 && !coachTeamSet.has(teamId)) {
    return [];
  }

  const { data: players } = await supabase
    .from('players')
    .select(
      `
      id,
      full_name,
      nickname,
      jersey_number,
      team_players (
        team_id,
        left_at,
        teams ( id, name )
      )
    `,
    )
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .order('nickname');

  let items = (players ?? [])
    .map((player) => {
      const teamPlayers = (player.team_players ?? []) as TeamPlayerJoin[];
      const teamNames = activeTeamNames(teamPlayers);
      return {
        id: player.id as string,
        fullName: player.full_name as string,
        nickname: player.nickname as string,
        jerseyNumber: player.jersey_number as number | null,
        teamNames,
        teamPlayers,
      };
    })
    .filter((player) => playerInCoachTeams(player.teamPlayers, coachTeamSet))
    .filter((player) => {
      if (!teamId) return true;
      return player.teamPlayers.some((tp) => !tp.left_at && tp.team_id === teamId);
    })
    .map(({ teamPlayers: _, ...player }) => player);

  if (search) {
    items = items.filter((player) => matchesSearch(player, search));
  }

  return items;
}

export async function getPlayerDetail(
  supabase: SupabaseClient,
  playerId: string,
): Promise<PlayerDetail | null> {
  const [{ data: player }, { data: attributes }, { data: measurement }] = await Promise.all([
    supabase
      .from('players')
      .select(
        `
        id, full_name, nickname, birth_date, jersey_number, position,
        dominant_hand, school, status, joined_at, guardian_name, guardian_phone, photo_path,
        team_players ( left_at, teams ( name ) )
      `,
      )
      .eq('id', playerId)
      .maybeSingle(),
    supabase
      .from('player_attributes')
      .select(
        'shooting, finishing, ballhandling, defense, athleticism, attitude, archetype, period_start, period_end',
      )
      .eq('player_id', playerId)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('player_measurements')
      .select('measured_on, height_cm, weight_kg, wingspan_cm, standing_reach_cm')
      .eq('player_id', playerId)
      .order('measured_on', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!player) return null;

  const teamNames = activeTeamNames((player.team_players ?? []) as TeamPlayerJoin[]);

  let photoUrl: string | null = null;
  if (player.photo_path) {
    const { data: signed } = await supabase.storage
      .from('player-photos')
      .createSignedUrl(player.photo_path, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  const { data: attendance } = await supabase
    .from('attendance')
    .select('status')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false })
    .limit(12);

  const records = attendance ?? [];
  const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  const absences = records.filter((r) => r.status === 'absent').length;
  const attendanceRate = records.length > 0 ? Math.round((present / records.length) * 100) : 0;

  return {
    id: player.id,
    fullName: player.full_name,
    nickname: player.nickname,
    birthDate: player.birth_date,
    age: player.birth_date ? calculateAge(player.birth_date) : null,
    jerseyNumber: player.jersey_number,
    position: player.position,
    dominantHand: player.dominant_hand,
    school: player.school,
    status: player.status,
    joinedAt: player.joined_at,
    teamNames,
    guardianName: player.guardian_name,
    guardianPhone: player.guardian_phone,
    photoUrl,
    attributes: attributes
      ? {
          shooting: Number(attributes.shooting),
          finishing: Number(attributes.finishing),
          ballhandling: Number(attributes.ballhandling),
          defense: Number(attributes.defense),
          athleticism: Number(attributes.athleticism),
          attitude: Number(attributes.attitude),
          archetype: attributes.archetype,
          periodStart: attributes.period_start,
          periodEnd: attributes.period_end,
        }
      : null,
    measurements: measurement
      ? {
          measuredOn: measurement.measured_on,
          heightCm: measurement.height_cm != null ? Number(measurement.height_cm) : null,
          weightKg: measurement.weight_kg != null ? Number(measurement.weight_kg) : null,
          wingspanCm: measurement.wingspan_cm != null ? Number(measurement.wingspan_cm) : null,
          standingReachCm:
            measurement.standing_reach_cm != null ? Number(measurement.standing_reach_cm) : null,
        }
      : null,
    attendanceRate,
    recentAbsences: absences,
  };
}
