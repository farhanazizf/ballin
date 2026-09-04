import { NextRequest, NextResponse } from 'next/server';
import { playerMeasurementSchema } from '@/lib/validators/player';
import { createPlayerMeasurement } from '@/lib/queries/players';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: playerId } = await context.params;
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
        { error: 'Akses ditolak.' },
        { status: 403 },
      );
    }

    const parsed = playerMeasurementSchema.safeParse({
      ...(await request.json()),
      playerId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data ukuran tidak valid. Periksa tanggal dan angka.' },
        { status: 400 },
      );
    }

    const result = await createPlayerMeasurement(
      supabase,
      profile.organization_id,
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
