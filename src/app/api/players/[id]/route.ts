import { NextRequest, NextResponse } from 'next/server';
import { playerUpdateSchema } from '@/lib/validators/player';
import { updatePlayer } from '@/lib/queries/players';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
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
        { error: 'Akses ditolak. Hanya coach atau admin yang dapat mengubah pemain.' },
        { status: 403 },
      );
    }

    const parsed = playerUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data pemain tidak valid. Periksa isian lalu coba lagi.' },
        { status: 400 },
      );
    }

    const coachTeamIds = await getCoachTeamIds(supabase, user.id);
    const result = await updatePlayer(
      supabase,
      profile.organization_id,
      coachTeamIds,
      id,
      parsed.data,
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 },
    );
  }
}
