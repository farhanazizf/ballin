import { NextRequest, NextResponse } from 'next/server';
import { syncAttendanceBatchSchema } from '@/lib/validators/sync';
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const parsed = syncAttendanceBatchSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Format absensi tidak valid.' }, { status: 400 });
    }

    const rows = parsed.data.records.map((r) => ({
      session_id: r.sessionId,
      player_id: r.playerId,
      session_date: r.sessionDate,
      status: r.status,
      method: r.method,
      checked_in_at: r.checkedInAt,
      recorded_by: r.recordedBy,
    }));

    const { error } = await supabase.from('attendance').upsert(rows, {
      onConflict: 'session_id,player_id',
    });

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error:
              'Pemain ini sudah tercatat hadir di sesi lain hari ini. Cek jadwal atau ubah status jadi izin/sakit/alfa.',
          },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: 'Gagal menyimpan absensi.' }, { status: 500 });
    }

    return NextResponse.json({ saved: rows.length });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}
