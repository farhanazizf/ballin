import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getMatchBoxScores, saveBoxScores } from '@/lib/queries/matches';
import { boxScoreBatchSchema } from '@/lib/validators/match';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const rows = await getMatchBoxScores(supabase, id);
  return NextResponse.json({ rows });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const parsed = boxScoreBatchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Box score tidak valid.' }, { status: 400 });

  const result = await saveBoxScores(supabase, id, parsed.data);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
