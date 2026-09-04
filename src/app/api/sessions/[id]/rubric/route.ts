import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRubricSessionData, saveRubricScores } from '@/lib/queries/rubric';
import { rubricBatchSchema } from '@/lib/validators/rubric';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const data = await getRubricSessionData(supabase, id);
  if (!data) return NextResponse.json({ error: 'Sesi tidak ditemukan.' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const parsed = rubricBatchSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data rubrik tidak valid.' }, { status: 400 });
  }

  const result = await saveRubricScores(supabase, id, user.id, parsed.data);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
