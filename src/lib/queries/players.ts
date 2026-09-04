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
      const teamPlayers = (player.team_players ?? []) as unknown as TeamPlayerJoin[];
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
        team_players ( left_at, team_id, teams ( name ) )
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

  const teamNames = activeTeamNames(
    (player.team_players ?? []) as unknown as TeamPlayerJoin[],
  );

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

export type PlayerEditData = {
  id: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  jerseyNumber: number | null;
  position: string | null;
  dominantHand: string | null;
  school: string | null;
  status: string;
  guardianName: string | null;
  guardianPhone: string | null;
  teamIds: string[];
};

export async function getPlayerForEdit(
  supabase: SupabaseClient,
  playerId: string,
): Promise<PlayerEditData | null> {
  const { data: player } = await supabase
    .from('players')
    .select(
      `
      id, full_name, nickname, birth_date, jersey_number, position,
      dominant_hand, school, status, guardian_name, guardian_phone,
      team_players ( team_id, left_at )
    `,
    )
    .eq('id', playerId)
    .maybeSingle();

  if (!player) return null;

  const teamPlayers = (player.team_players ?? []) as Array<{
    team_id: string;
    left_at: string | null;
  }>;

  return {
    id: player.id,
    fullName: player.full_name,
    nickname: player.nickname,
    birthDate: player.birth_date,
    jerseyNumber: player.jersey_number,
    position: player.position,
    dominantHand: player.dominant_hand,
    school: player.school,
    status: player.status,
    guardianName: player.guardian_name,
    guardianPhone: player.guardian_phone,
    teamIds: teamPlayers.filter((tp) => !tp.left_at).map((tp) => tp.team_id),
  };
}

export async function findNicknameConflict(
  supabase: SupabaseClient,
  orgId: string,
  nickname: string,
  teamIds: string[],
  excludePlayerId?: string,
): Promise<string | null> {
  if (teamIds.length === 0) return null;

  const { data: rows } = await supabase
    .from('team_players')
    .select('team_id, players!inner(id, nickname, organization_id)')
    .in('team_id', teamIds)
    .is('left_at', null);

  const normalized = nickname.trim().toLowerCase();
  for (const row of rows ?? []) {
    const raw = row.players as
      | { id: string; nickname: string; organization_id: string }
      | { id: string; nickname: string; organization_id: string }[]
      | null;
    const player = Array.isArray(raw) ? raw[0] : raw;
    if (!player) continue;
    if (player.organization_id !== orgId) continue;
    if (excludePlayerId && player.id === excludePlayerId) continue;
    if (player.nickname.trim().toLowerCase() === normalized) {
      return player.nickname;
    }
  }

  return null;
}

function filterAllowedTeamIds(
  teamIds: string[],
  coachTeamIds: string[],
): string[] | { error: string } {
  if (coachTeamIds.length === 0) return teamIds;
  const allowed = new Set(coachTeamIds);
  const filtered = teamIds.filter((id) => allowed.has(id));
  if (filtered.length === 0) {
    return { error: 'Pilih minimal satu kelas yang Anda tangani.' };
  }
  if (filtered.length !== teamIds.length) {
    return { error: 'Beberapa kelas tidak bisa Anda kelola. Periksa pilihan kelas.' };
  }
  return filtered;
}

export async function createPlayer(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  coachTeamIds: string[],
  input: import('@/lib/validators/player').PlayerInput,
): Promise<{ id: string } | { error: string }> {
  const teamResult = filterAllowedTeamIds(input.teamIds, coachTeamIds);
  if ('error' in teamResult) return teamResult;
  const teamIds = teamResult;

  const conflict = await findNicknameConflict(supabase, orgId, input.nickname, teamIds);
  if (conflict) {
    return {
      error: `Nama panggilan "${conflict}" sudah dipakai di kelas ini. Gunakan nama lain.`,
    };
  }

  const { data: player, error } = await supabase
    .from('players')
    .insert({
      organization_id: orgId,
      full_name: input.fullName.trim(),
      nickname: input.nickname.trim(),
      birth_date: input.birthDate,
      jersey_number: input.jerseyNumber ?? null,
      position: input.position?.trim() || null,
      dominant_hand: input.dominantHand ?? null,
      school: input.school?.trim() || null,
      guardian_name: input.guardianName?.trim() || null,
      guardian_phone: input.guardianPhone?.trim() || null,
    })
    .select('id')
    .single();

  if (error || !player) {
    return { error: 'Gagal menyimpan pemain. Coba lagi dalam beberapa saat.' };
  }

  const { error: teamError } = await supabase.from('team_players').insert(
    teamIds.map((teamId) => ({
      team_id: teamId,
      player_id: player.id,
    })),
  );

  if (teamError) {
    await supabase.from('players').delete().eq('id', player.id);
    return { error: 'Gagal menetapkan kelas pemain. Coba lagi.' };
  }

  void coachId;
  return { id: player.id };
}

export async function updatePlayer(
  supabase: SupabaseClient,
  orgId: string,
  coachTeamIds: string[],
  playerId: string,
  input: import('@/lib/validators/player').PlayerUpdateInput,
): Promise<{ ok: true } | { error: string }> {
  const { data: existing } = await supabase
    .from('players')
    .select('id, organization_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!existing || existing.organization_id !== orgId) {
    return { error: 'Pemain tidak ditemukan.' };
  }

  if (input.teamIds) {
    const teamResult = filterAllowedTeamIds(input.teamIds, coachTeamIds);
    if ('error' in teamResult) return teamResult;

    const nickname = input.nickname?.trim();
    const { data: current } = await supabase
      .from('players')
      .select('nickname')
      .eq('id', playerId)
      .single();

    const conflict = await findNicknameConflict(
      supabase,
      orgId,
      nickname ?? current?.nickname ?? '',
      teamResult,
      playerId,
    );
    if (conflict) {
      return {
        error: `Nama panggilan "${conflict}" sudah dipakai di kelas ini. Gunakan nama lain.`,
      };
    }

    const { data: memberships } = await supabase
      .from('team_players')
      .select('team_id, left_at')
      .eq('player_id', playerId);

    const active = new Set(
      (memberships ?? []).filter((m) => !m.left_at).map((m) => m.team_id as string),
    );
    const desired = new Set(teamResult);
    const today = new Date().toISOString().slice(0, 10);

    for (const teamId of teamResult) {
      if (active.has(teamId)) continue;

      const { data: prior } = await supabase
        .from('team_players')
        .select('left_at')
        .eq('team_id', teamId)
        .eq('player_id', playerId)
        .maybeSingle();

      if (prior) {
        const { error: rejoinError } = await supabase
          .from('team_players')
          .update({ left_at: null })
          .eq('team_id', teamId)
          .eq('player_id', playerId);
        if (rejoinError) {
          return { error: 'Gagal memperbarui kelas pemain. Coba lagi.' };
        }
      } else {
        const { error: insertError } = await supabase.from('team_players').insert({
          team_id: teamId,
          player_id: playerId,
        });
        if (insertError) {
          return { error: 'Gagal memperbarui kelas pemain. Coba lagi.' };
        }
      }
    }

    for (const teamId of active) {
      if (!desired.has(teamId)) {
        const { error: leaveError } = await supabase
          .from('team_players')
          .update({ left_at: today })
          .eq('player_id', playerId)
          .eq('team_id', teamId)
          .is('left_at', null);
        if (leaveError) {
          return { error: 'Gagal memperbarui kelas pemain. Coba lagi.' };
        }
      }
    }
  } else if (input.nickname) {
    const { data: currentTeams } = await supabase
      .from('team_players')
      .select('team_id')
      .eq('player_id', playerId)
      .is('left_at', null);

    const teamIds = (currentTeams ?? []).map((t) => t.team_id as string);
    const conflict = await findNicknameConflict(
      supabase,
      orgId,
      input.nickname,
      teamIds,
      playerId,
    );
    if (conflict) {
      return {
        error: `Nama panggilan "${conflict}" sudah dipakai di kelas ini. Gunakan nama lain.`,
      };
    }
  }

  const update: {
    full_name?: string;
    nickname?: string;
    birth_date?: string;
    jersey_number?: number | null;
    position?: string | null;
    dominant_hand?: string | null;
    school?: string | null;
    guardian_name?: string | null;
    guardian_phone?: string | null;
    status?: string;
  } = {};

  if (input.fullName !== undefined) update.full_name = input.fullName.trim();
  if (input.nickname !== undefined) update.nickname = input.nickname.trim();
  if (input.birthDate !== undefined) update.birth_date = input.birthDate;
  if (input.jerseyNumber !== undefined) update.jersey_number = input.jerseyNumber ?? null;
  if (input.position !== undefined) update.position = input.position?.trim() || null;
  if (input.dominantHand !== undefined) update.dominant_hand = input.dominantHand ?? null;
  if (input.school !== undefined) update.school = input.school?.trim() || null;
  if (input.guardianName !== undefined) update.guardian_name = input.guardianName?.trim() || null;
  if (input.guardianPhone !== undefined) update.guardian_phone = input.guardianPhone?.trim() || null;
  if (input.status !== undefined) update.status = input.status;

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from('players').update(update).eq('id', playerId);
    if (error) {
      return { error: 'Gagal memperbarui pemain. Coba lagi dalam beberapa saat.' };
    }
  }

  return { ok: true };
}

export type PlayerMeasurementRow = {
  id: string;
  measuredOn: string;
  heightCm: number | null;
  weightKg: number | null;
  wingspanCm: number | null;
  standingReachCm: number | null;
};

export async function getPlayerMeasurements(
  supabase: SupabaseClient,
  playerId: string,
): Promise<PlayerMeasurementRow[]> {
  const { data } = await supabase
    .from('player_measurements')
    .select('id, measured_on, height_cm, weight_kg, wingspan_cm, standing_reach_cm')
    .eq('player_id', playerId)
    .order('measured_on', { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    measuredOn: row.measured_on,
    heightCm: row.height_cm != null ? Number(row.height_cm) : null,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    wingspanCm: row.wingspan_cm != null ? Number(row.wingspan_cm) : null,
    standingReachCm: row.standing_reach_cm != null ? Number(row.standing_reach_cm) : null,
  }));
}

export async function createPlayerMeasurement(
  supabase: SupabaseClient,
  orgId: string,
  input: import('@/lib/validators/player').PlayerMeasurementInput,
): Promise<{ id: string } | { error: string }> {
  const { data: player } = await supabase
    .from('players')
    .select('id, organization_id')
    .eq('id', input.playerId)
    .maybeSingle();

  if (!player || player.organization_id !== orgId) {
    return { error: 'Pemain tidak ditemukan.' };
  }

  const { data, error } = await supabase
    .from('player_measurements')
    .upsert(
      {
        player_id: input.playerId,
        measured_on: input.measuredOn,
        height_cm: input.heightCm ?? null,
        weight_kg: input.weightKg ?? null,
        wingspan_cm: input.wingspanCm ?? null,
        standing_reach_cm: input.standingReachCm ?? null,
      },
      { onConflict: 'player_id,measured_on' },
    )
    .select('id')
    .single();

  if (error || !data) {
    return { error: 'Gagal menyimpan ukuran tubuh. Coba lagi.' };
  }

  return { id: data.id };
}

export type AttendanceHistoryItem = {
  sessionDate: string;
  status: string;
};

export type DrillTrendPoint = {
  sessionDate: string;
  display: string;
};

export type DrillTrendSeries = {
  drillName: string;
  points: DrillTrendPoint[];
};

type DrillTrendRow = {
  updated_at: string;
  made: number;
  attempts: number;
  value: number | null;
  session_drills: {
    drill_id: string;
    drills: { name: string; type: string; unit: string | null };
  };
};

export async function getPlayerAttendanceHistory(
  supabase: SupabaseClient,
  playerId: string,
  limit = 12,
): Promise<AttendanceHistoryItem[]> {
  const { data } = await supabase
    .from('attendance')
    .select('session_date, status')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    sessionDate: row.session_date as string,
    status: row.status as string,
  }));
}

export async function getPlayerDrillTrends(
  supabase: SupabaseClient,
  playerId: string,
  drillLimit = 3,
  pointLimit = 5,
): Promise<DrillTrendSeries[]> {
  const { data } = await supabase
    .from('drill_results')
    .select(
      `
      made,
      attempts,
      value,
      updated_at,
      session_drills!inner (
        drill_id,
        drills!inner ( name, type, unit )
      )
    `,
    )
    .eq('player_id', playerId)
    .eq('is_dnp', false)
    .order('updated_at', { ascending: false })
    .limit(60);

  const rows = (data ?? []) as unknown as DrillTrendRow[];
  const byDrill = new Map<string, DrillTrendRow[]>();

  for (const row of rows) {
    const drillId = row.session_drills.drill_id;
    const list = byDrill.get(drillId) ?? [];
    list.push(row);
    byDrill.set(drillId, list);
  }

  const series: DrillTrendSeries[] = [];

  for (const drillRows of byDrill.values()) {
    if (series.length >= drillLimit) break;

    const drill = drillRows[0].session_drills.drills;
    const points = drillRows.slice(0, pointLimit).map((row) => {
      if (drill.type === 'attempt' || drill.type === 'count_in_time') {
        return {
          sessionDate: row.updated_at,
          display: `${row.made}/${row.attempts}`,
        };
      }

      if (row.value == null) {
        return { sessionDate: row.updated_at, display: '—' };
      }

      const unit = drill.unit ? ` ${drill.unit}` : '';
      return {
        sessionDate: row.updated_at,
        display: `${Number(row.value)}${unit}`,
      };
    });

    series.push({ drillName: drill.name, points });
  }

  return series;
}
