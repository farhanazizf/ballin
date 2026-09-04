import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createPlayerNote, getSessionNotesContext, saveSessionNotes } from '@/lib/queries/notes';
import { playerNoteSchema, sessionNotesSchema } from '@/lib/validators/note';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const data = await getSessionNotesContext(supabase, id);
  if (!data) return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const body = await request.json();
  if (body.action === 'session') {
    const parsed = sessionNotesSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Catatan sesi tidak valid.' }, { status: 400 });
    const result = await saveSessionNotes(supabase, id, parsed.data);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const parsed = playerNoteSchema.safeParse({ ...body, sessionId: id });
  if (!parsed.success) return NextResponse.json({ error: 'Catatan pemain tidak valid.' }, { status: 400 });
  const result = await createPlayerNote(supabase, user.id, parsed.data);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id }, { status: 201 });
}
