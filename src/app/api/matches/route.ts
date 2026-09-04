import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createMatch, getMatchesForCoach } from '@/lib/queries/matches';
import { matchInputSchema } from '@/lib/validators/match';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).maybeSingle();
  if (!profile?.organization_id || !['admin', 'coach'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const matches = await getMatchesForCoach(supabase, profile.organization_id, user.id);
  return NextResponse.json({ matches });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('organization_id, role').eq('id', user.id).maybeSingle();
  if (!profile?.organization_id || !['admin', 'coach'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const parsed = matchInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Data pertandingan tidak valid.' }, { status: 400 });

  const result = await createMatch(supabase, profile.organization_id, user.id, parsed.data);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ id: result.id }, { status: 201 });
}
