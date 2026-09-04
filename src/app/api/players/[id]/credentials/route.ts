import { NextRequest, NextResponse } from 'next/server';
import { playerCredentialsSchema } from '@/lib/validators/auth';
import {
  getPlayerCredentialsView,
  upsertPlayerCredentials,
} from '@/lib/queries/player-credentials';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

async function authorizeCoachOrAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 }) };
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
    return { error: NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 }) };
  }

  return { orgId: profile.organization_id };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await authorizeCoachOrAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await context.params;
    const admin = createAdminClient();
    const view = await getPlayerCredentialsView(admin, id);

    if (!view) {
      return NextResponse.json({ error: 'Pemain tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json(view);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authorizeCoachOrAdmin();
    if ('error' in auth) return auth.error;

    const { id } = await context.params;
    const parsed = playerCredentialsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Username dan PIN tidak valid.' },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const result = await upsertPlayerCredentials(
      admin,
      auth.orgId,
      id,
      parsed.data,
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 });
  }
}
