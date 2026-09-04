import { NextRequest, NextResponse } from 'next/server';
import { drillUpdateSchema, type DrillInput } from '@/lib/validators/drill';
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
        { error: 'Hanya admin yang dapat mengelola drill.' },
        { status: 403 },
      );
    }

    const parsed = drillUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data drill tidak valid. Periksa isian lalu coba lagi.' },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const update: {
      name?: string;
      category?: string;
      type?: DrillInput['type'];
      default_target?: number | null;
      unit?: string | null;
      lower_is_better?: boolean;
      attribute_weights?: Record<string, number>;
      instructions?: string | null;
      video_url?: string | null;
      is_archived?: boolean;
    } = {};
    if (payload.name !== undefined) update.name = payload.name.trim();
    if (payload.category !== undefined) update.category = payload.category;
    if (payload.type !== undefined) update.type = payload.type;
    if (payload.defaultTarget !== undefined) {
      update.default_target = payload.defaultTarget;
    }
    if (payload.unit !== undefined) update.unit = payload.unit || null;
    if (payload.lowerIsBetter !== undefined) {
      update.lower_is_better = payload.lowerIsBetter;
    }
    if (payload.attributeWeights !== undefined) {
      update.attribute_weights = payload.attributeWeights;
    }
    if (payload.instructions !== undefined) {
      update.instructions = payload.instructions || null;
    }
    if (payload.videoUrl !== undefined) update.video_url = payload.videoUrl || null;
    if (payload.isArchived !== undefined) update.is_archived = payload.isArchived;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada perubahan untuk disimpan.' },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from('drills')
      .update(update)
      .eq('id', id)
      .eq('organization_id', profile.organization_id);

    if (error) {
      return NextResponse.json(
        { error: 'Gagal memperbarui drill. Coba lagi dalam beberapa saat.' },
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
