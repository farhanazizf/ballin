import { NextResponse } from 'next/server';
import { getAttendanceSetup } from '@/lib/queries/attendance-setup';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
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
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'coach'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya coach atau admin yang dapat membuka absensi.' },
        { status: 403 },
      );
    }

    const setup = await getAttendanceSetup(id);
    if (!setup) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan. Periksa jadwal lalu coba lagi.' },
        { status: 404 },
      );
    }

    return NextResponse.json(setup);
  } catch {
    return NextResponse.json(
      { error: 'Gagal memuat data absensi. Coba lagi.' },
      { status: 500 },
    );
  }
}
