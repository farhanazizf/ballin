import { NextRequest, NextResponse } from 'next/server';
import { teamSchema } from '@/lib/validators/team';
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

    if (!profile?.organization_id || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat mengelola kelas.' },
        { status: 403 },
      );
    }

    const parsed = teamSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data kelas tidak valid. Periksa nama dan rentang usia.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('teams')
      .insert({
        organization_id: profile.organization_id,
        name: parsed.data.name.trim(),
        age_min: parsed.data.ageMin ?? null,
        age_max: parsed.data.ageMax ?? null,
        track_drill_stats: parsed.data.trackDrillStats,
        is_active: parsed.data.isActive,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menyimpan kelas. Coba lagi dalam beberapa saat.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 },
    );
  }
}
