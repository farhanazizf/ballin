import type { SupabaseClient } from '@supabase/supabase-js';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import type { BoxScoreBatchInput, MatchInput } from '@/lib/validators/match';

export type MatchListItem = {
  id: string;
  opponent: string;
  matchType: string;
  playedAt: string;
  location: string | null;
  scoreFor: number | null;
  scoreAgainst: number | null;
  teamName: string;
  teamId: string;
};

export type MatchDetail = MatchListItem & {
  notes: string | null;
};

export type BoxScoreRow = {
  playerId: string;
  nickname: string;
  minutes: number | null;
  points: number | null;
  fgm: number | null;
  fga: number | null;
  tpm: number | null;
  tpa: number | null;
  ftm: number | null;
  fta: number | null;
  oreb: number | null;
  dreb: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  fouls: number | null;
};

export async function getMatchesForCoach(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
): Promise<MatchListItem[]> {
  const teamIds = await getCoachTeamIds(supabase, coachId);
  let query = supabase
    .from('matches')
    .select('id, opponent, match_type, played_at, location, score_for, score_against, team_id')
    .eq('organization_id', orgId)
    .order('played_at', { ascending: false })
    .limit(30);

  if (teamIds.length > 0) query = query.in('team_id', teamIds);

  const { data: matches } = await query;
  if (!matches?.length) return [];

  const uniqueTeamIds = [...new Set(matches.map((m) => m.team_id as string))];
  const { data: teams } = await supabase.from('teams').select('id, name').in('id', uniqueTeamIds);
  const teamNames = new Map((teams ?? []).map((t) => [t.id as string, t.name as string]));

  return matches.map((m) => ({
    id: m.id as string,
    opponent: m.opponent as string,
    matchType: m.match_type as string,
    playedAt: m.played_at as string,
    location: m.location as string | null,
    scoreFor: m.score_for as number | null,
    scoreAgainst: m.score_against as number | null,
    teamName: teamNames.get(m.team_id as string) ?? '',
    teamId: m.team_id as string,
  }));
}

export async function createMatch(
  supabase: SupabaseClient,
  orgId: string,
  coachId: string,
  input: MatchInput,
): Promise<{ id: string } | { error: string }> {
  const teamIds = await getCoachTeamIds(supabase, coachId);
  if (teamIds.length > 0 && !teamIds.includes(input.teamId)) {
    return { error: 'Kelas tidak ditemukan atau Anda belum ditugaskan ke kelas ini.' };
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      organization_id: orgId,
      team_id: input.teamId,
      opponent: input.opponent.trim(),
      match_type: input.matchType,
      played_at: input.playedAt,
      location: input.location?.trim() || null,
      score_for: input.scoreFor ?? null,
      score_against: input.scoreAgainst ?? null,
      notes: input.notes?.trim() || null,
    })
    .select('id')
    .single();

  if (error || !data) return { error: 'Gagal menyimpan pertandingan. Coba lagi.' };
  return { id: data.id as string };
}

export async function getMatchDetail(
  supabase: SupabaseClient,
  matchId: string,
): Promise<MatchDetail | null> {
  const { data: match } = await supabase
    .from('matches')
    .select('id, opponent, match_type, played_at, location, score_for, score_against, team_id, notes')
    .eq('id', matchId)
    .maybeSingle();

  if (!match) return null;

  const { data: team } = await supabase.from('teams').select('name').eq('id', match.team_id).maybeSingle();

  return {
    id: match.id as string,
    opponent: match.opponent as string,
    matchType: match.match_type as string,
    playedAt: match.played_at as string,
    location: match.location as string | null,
    scoreFor: match.score_for as number | null,
    scoreAgainst: match.score_against as number | null,
    teamName: team?.name ?? '',
    teamId: match.team_id as string,
    notes: match.notes as string | null,
  };
}

export async function getMatchBoxScores(
  supabase: SupabaseClient,
  matchId: string,
): Promise<BoxScoreRow[]> {
  const { data: match } = await supabase.from('matches').select('team_id').eq('id', matchId).maybeSingle();
  if (!match) return [];

  const [{ data: roster }, { data: scores }] = await Promise.all([
    supabase
      .from('team_players')
      .select('player_id, players ( nickname )')
      .eq('team_id', match.team_id)
      .is('left_at', null),
    supabase.from('box_scores').select('*').eq('match_id', matchId),
  ]);

  const scoreMap = new Map((scores ?? []).map((row) => [row.player_id as string, row]));

  return (roster ?? []).map((row) => {
    const raw = row.players as { nickname: string } | { nickname: string }[] | null;
    const player = Array.isArray(raw) ? raw[0] : raw;
    const score = scoreMap.get(row.player_id as string);
    return {
      playerId: row.player_id as string,
      nickname: player?.nickname ?? 'Pemain',
      minutes: score?.minutes ?? null,
      points: score?.points ?? null,
      fgm: score?.fgm ?? null,
      fga: score?.fga ?? null,
      tpm: score?.tpm ?? null,
      tpa: score?.tpa ?? null,
      ftm: score?.ftm ?? null,
      fta: score?.fta ?? null,
      oreb: score?.oreb ?? null,
      dreb: score?.dreb ?? null,
      assists: score?.assists ?? null,
      steals: score?.steals ?? null,
      blocks: score?.blocks ?? null,
      turnovers: score?.turnovers ?? null,
      fouls: score?.fouls ?? null,
    };
  });
}

export async function saveBoxScores(
  supabase: SupabaseClient,
  matchId: string,
  input: BoxScoreBatchInput,
): Promise<{ ok: true } | { error: string }> {
  for (const row of input.rows) {
    const { error } = await supabase.from('box_scores').upsert(
      {
        match_id: matchId,
        player_id: row.playerId,
        minutes: row.minutes ?? null,
        points: row.points ?? null,
        fgm: row.fgm ?? null,
        fga: row.fga ?? null,
        tpm: row.tpm ?? null,
        tpa: row.tpa ?? null,
        ftm: row.ftm ?? null,
        fta: row.fta ?? null,
        oreb: row.oreb ?? null,
        dreb: row.dreb ?? null,
        assists: row.assists ?? null,
        steals: row.steals ?? null,
        blocks: row.blocks ?? null,
        turnovers: row.turnovers ?? null,
        fouls: row.fouls ?? null,
      },
      { onConflict: 'match_id,player_id' },
    );

    if (error) return { error: 'Gagal menyimpan box score. Coba lagi.' };
  }

  return { ok: true };
}
