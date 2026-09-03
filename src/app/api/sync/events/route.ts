import { NextRequest, NextResponse } from 'next/server';
import { syncEventsBatchSchema } from '@/lib/validators/sync';
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
        { status: 401 }
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
        { status: 403 }
      );
    }

    const parsed = syncEventsBatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Format data tidak valid. Periksa isi batch lalu coba kirim lagi.' },
        { status: 400 }
      );
    }

    const rows = parsed.data.events.map((event) => ({
      client_event_id: event.clientEventId,
      session_drill_id: event.sessionDrillId,
      player_id: event.playerId,
      result: event.result,
      value: event.value ?? null,
      occurred_at: event.occurredAt,
      device_id: event.deviceId,
      recorded_by: event.recordedBy,
    }));

    const { data, error } = await supabase
      .from('drill_events')
      .upsert(rows, { onConflict: 'client_event_id', ignoreDuplicates: true })
      .select('client_event_id');

    if (error) {
      return NextResponse.json(
        { error: 'Gagal menyimpan event. Coba lagi dalam beberapa saat.' },
        { status: 500 }
      );
    }

    const inserted = data?.length ?? 0;

    return NextResponse.json({
      inserted,
      duplicates: rows.length - inserted,
    });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 }
    );
  }
}
