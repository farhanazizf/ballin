import { NextRequest, NextResponse } from 'next/server';
import { teamUpdateSchema } from '@/lib/validators/team';
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

    if (!profile?.organization_id || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat mengelola kelas.' },
        { status: 403 },
      );
    }

    const parsed = teamUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data kelas tidak valid. Periksa nama dan rentang usia.' },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const update: {
      name?: string;
      age_min?: number | null;
      age_max?: number | null;
      track_drill_stats?: boolean;
      is_active?: boolean;
    } = {};
    if (payload.name !== undefined) update.name = payload.name.trim();
    if (payload.ageMin !== undefined) update.age_min = payload.ageMin;
    if (payload.ageMax !== undefined) update.age_max = payload.ageMax;
    if (payload.trackDrillStats !== undefined) {
      update.track_drill_stats = payload.trackDrillStats;
    }
    if (payload.isActive !== undefined) update.is_active = payload.isActive;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan untuk disimpan.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('teams')
      .update(update)
      .eq('id', id)
      .eq('organization_id', profile.organization_id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memperbarui kelas. Coba lagi dalam beberapa saat.' },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 },
    );
  }
}
