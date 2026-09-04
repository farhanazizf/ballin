import { NextRequest, NextResponse } from 'next/server';
import { drillSchema } from '@/lib/validators/drill';
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
        { error: 'Hanya admin yang dapat mengelola drill.' },
        { status: 403 },
      );
    }

    const parsed = drillSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data drill tidak valid. Periksa nama, kategori, dan tipe.' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('drills')
      .insert({
        organization_id: profile.organization_id,
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        type: parsed.data.type,
        default_target: parsed.data.defaultTarget ?? null,
        unit: parsed.data.unit ?? null,
        lower_is_better: parsed.data.lowerIsBetter,
        attribute_weights: parsed.data.attributeWeights,
        instructions: parsed.data.instructions ?? null,
        video_url: parsed.data.videoUrl ?? null,
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menyimpan drill. Coba lagi dalam beberapa saat.' },
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
