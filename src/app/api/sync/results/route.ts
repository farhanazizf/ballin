import { NextRequest, NextResponse } from 'next/server';
import { syncResultsBatchSchema } from '@/lib/validators/sync';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi berakhir. Masuk lagi.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const parsed = syncResultsBatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data review tidak valid. Periksa angka made/attempts.' },
        { status: 400 },
      );
    }

    const rows = parsed.data.results.map((result) => ({
      session_drill_id: result.sessionDrillId,
      player_id: result.playerId,
      made: result.made,
      attempts: result.attempts,
      is_dnp: result.isDnp,
      overridden: true,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('drill_results')
      .upsert(rows, { onConflict: 'session_drill_id,player_id' });

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menyimpan hasil review. Coba lagi.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ upserted: rows.length });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}
