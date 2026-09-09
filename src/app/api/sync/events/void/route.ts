import { NextRequest, NextResponse } from 'next/server';
import { syncVoidEventsBatchSchema } from '@/lib/validators/sync';
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya coach atau admin yang dapat menyinkronkan.' },
        { status: 403 },
      );
    }

    const parsed = syncVoidEventsBatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Format data tidak valid. Periksa isi batch lalu coba kirim lagi.' },
        { status: 400 },
      );
    }

    for (const item of parsed.data.voids) {
      const { error } = await supabase
        .from('drill_events')
        .update({ voided_at: item.voidedAt })
        .eq('client_event_id', item.targetClientEventId)
        .is('voided_at', null);

      if (error) {
        return NextResponse.json(
          { error: 'Gagal membatalkan event. Coba lagi dalam beberapa saat.' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ voided: parsed.data.voids.length });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 });
  }
}
