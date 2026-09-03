import { NextRequest, NextResponse } from 'next/server';
import { sessionSchema } from '@/lib/validators/session';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi berakhir. Masuk lagi untuk melanjutkan.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Hanya coach atau admin yang dapat membuat sesi.' }, { status: 403 });
    }

    const parsed = sessionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Data sesi tidak valid. Periksa kelas dan waktu lalu coba lagi.' },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        organization_id: profile.organization_id,
        team_id: input.teamId,
        scheduled_start: input.scheduledStart,
        scheduled_end: input.scheduledEnd ?? null,
        location: input.location ?? null,
        session_type: input.sessionType,
        status: 'scheduled',
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Gagal membuat sesi. Coba lagi dalam beberapa saat.' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 });
  }
}
