import { NextRequest, NextResponse } from 'next/server';
import { sessionCancelSchema } from '@/lib/validators/session';
import { cancelSession } from '@/lib/queries/sessions';
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

    if (
      !profile?.organization_id ||
      !['admin', 'coach'].includes(profile.role)
    ) {
      return NextResponse.json(
        { error: 'Akses ditolak.' },
        { status: 403 },
      );
    }

    const body = await request.json();
    if (body?.action !== 'cancel') {
      return NextResponse.json(
        { error: 'Aksi tidak dikenali.' },
        { status: 400 },
      );
    }

    const parsed = sessionCancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Alasan pembatalan wajib diisi.' },
        { status: 400 },
      );
    }

    const result = await cancelSession(
      supabase,
      profile.organization_id,
      user.id,
      id,
      parsed.data,
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 },
    );
  }
}
