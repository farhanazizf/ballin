import { NextRequest, NextResponse } from 'next/server';
import { playerSchema } from '@/lib/validators/player';
import { createPlayer } from '@/lib/queries/players';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Sesi berakhir. Masuk lagi untuk melanjutkan.' },
        { status: 401 },
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (
      !profile?.organization_id ||
      !['admin', 'coach'].includes(profile.role)
    ) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya coach atau admin yang dapat menambah pemain.' },
        { status: 403 },
      );
    }

    const parsed = playerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data pemain tidak valid. Periksa nama, tanggal lahir, dan kelas.' },
        { status: 400 },
      );
    }

    const coachTeamIds = await getCoachTeamIds(supabase, user.id);
    const result = await createPlayer(
      supabase,
      profile.organization_id,
      user.id,
      coachTeamIds,
      parsed.data,
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 },
    );
  }
}
