import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlayerNoteInput, SessionNotesInput } from '@/lib/validators/note';

export type PlayerNoteRow = {
  id: string;
  playerId: string;
  playerName: string;
  sessionId: string | null;
  note: string;
  kind: string;
  createdAt: string;
};

export async function getSessionNotesContext(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<{ sessionNotes: string | null; playerNotes: PlayerNoteRow[] } | null> {
  const { data: session } = await supabase
    .from('sessions')
    .select('notes')
    .eq('id', sessionId)
    .maybeSingle();

  if (!session) return null;

  const { data: notes } = await supabase
    .from('player_notes')
    .select('id, player_id, session_id, note, kind, created_at, players ( nickname )')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  const playerNotes: PlayerNoteRow[] = (notes ?? []).map((row) => {
    const raw = row.players as { nickname: string } | { nickname: string }[] | null;
    const player = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id as string,
      playerId: row.player_id as string,
      playerName: player?.nickname ?? 'Pemain',
      sessionId: row.session_id as string | null,
      note: row.note as string,
      kind: row.kind as string,
      createdAt: row.created_at as string,
    };
  });

  return { sessionNotes: session.notes as string | null, playerNotes };
}

export async function saveSessionNotes(
  supabase: SupabaseClient,
  sessionId: string,
  input: SessionNotesInput,
): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase
    .from('sessions')
    .update({ notes: input.notes?.trim() || null })
    .eq('id', sessionId);

  if (error) return { error: 'Gagal menyimpan catatan sesi. Coba lagi.' };
  return { ok: true };
}

export async function createPlayerNote(
  supabase: SupabaseClient,
  coachId: string,
  input: PlayerNoteInput,
): Promise<{ id: string } | { error: string }> {
  const { data, error } = await supabase
    .from('player_notes')
    .insert({
      player_id: input.playerId,
      session_id: input.sessionId ?? null,
      note: input.note.trim(),
      kind: input.kind,
      created_by: coachId,
    })
    .select('id')
    .single();

  if (error || !data) return { error: 'Gagal menyimpan catatan pemain. Coba lagi.' };
  return { id: data.id as string };
}
