import type { SupabaseClient } from '@supabase/supabase-js';
import { pickRubricPlayers, type RubricRotationPlayer } from '@/lib/field/rubric-rotation';
import type { RubricBatchInput } from '@/lib/validators/rubric';

export type RubricPlayerRow = {
  playerId: string;
  nickname: string;
  effort: number | null;
  coachability: number | null;
  discipline: number | null;
};

export type RubricSessionData = {
  sessionId: string;
  teamId: string;
  rotation: RubricRotationPlayer[];
  scores: RubricPlayerRow[];
};

export async function getRubricSessionData(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<RubricSessionData | null> {
  const { data: session } = await supabase
    .from('sessions')
    .select('id, team_id')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) return null;

  const { data: rosterRows } = await supabase
    .from('team_players')
    .select('player_id, players ( id, nickname )')
    .eq('team_id', session.team_id)
    .is('left_at', null);

  const rosterPlayerIds = (rosterRows ?? []).map((row) => row.player_id as string);

  const [{ data: scores }, { data: history }] = await Promise.all([
    supabase
      .from('rubric_scores')
      .select('player_id, effort, coachability, discipline')
      .eq('session_id', sessionId),
    rosterPlayerIds.length > 0
      ? supabase
          .from('rubric_scores')
          .select('player_id, created_at')
          .in('player_id', rosterPlayerIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const lastScored = new Map<string, string>();
  for (const row of history ?? []) {
    const playerId = row.player_id as string;
    if (!lastScored.has(playerId)) {
      lastScored.set(playerId, row.created_at as string);
    }
  }

  const roster: RubricRotationPlayer[] = (rosterRows ?? []).map((row) => {
    const raw = row.players as { id: string; nickname: string } | { id: string; nickname: string }[] | null;
    const player = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: player?.id ?? (row.player_id as string),
      nickname: player?.nickname ?? 'Pemain',
      lastScoredAt: lastScored.get(row.player_id as string) ?? null,
    };
  });

  const scoredIds = new Set((scores ?? []).map((row) => row.player_id as string));
  const rotation = pickRubricPlayers(roster, scoredIds, 5);

  const scoreMap = new Map(
    (scores ?? []).map((row) => [
      row.player_id as string,
      {
        playerId: row.player_id as string,
        nickname: roster.find((p) => p.id === row.player_id)?.nickname ?? 'Pemain',
        effort: row.effort as number | null,
        coachability: row.coachability as number | null,
        discipline: row.discipline as number | null,
      },
    ]),
  );

  const allScores: RubricPlayerRow[] = roster.map((player) =>
    scoreMap.get(player.id) ?? {
      playerId: player.id,
      nickname: player.nickname,
      effort: null,
      coachability: null,
      discipline: null,
    },
  );

  return {
    sessionId,
    teamId: session.team_id as string,
    rotation,
    scores: allScores,
  };
}

export async function saveRubricScores(
  supabase: SupabaseClient,
  sessionId: string,
  coachId: string,
  input: RubricBatchInput,
): Promise<{ ok: true } | { error: string }> {
  for (const score of input.scores) {
    const hasAny =
      score.effort != null || score.coachability != null || score.discipline != null;
    if (!hasAny) continue;

    const { error } = await supabase.from('rubric_scores').upsert(
      {
        session_id: sessionId,
        player_id: score.playerId,
        effort: score.effort ?? null,
        coachability: score.coachability ?? null,
        discipline: score.discipline ?? null,
        recorded_by: coachId,
      },
      { onConflict: 'session_id,player_id' },
    );

    if (error) {
      return { error: 'Gagal menyimpan rubrik. Coba lagi.' };
    }
  }

  return { ok: true };
}
