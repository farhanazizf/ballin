import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

async function requireCoach(request: NextRequest, playerId: string) {
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

  if (!profile?.organization_id || !['admin', 'coach'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 }) };
  }

  const { data: player } = await supabase
    .from('players')
    .select('id, organization_id, nickname')
    .eq('id', playerId)
    .maybeSingle();

  if (!player || player.organization_id !== profile.organization_id) {
    return { error: NextResponse.json({ error: 'Pemain tidak ditemukan.' }, { status: 404 }) };
  }

  return { supabase, orgId: profile.organization_id as string, player };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireCoach(_request, id);
  if ('error' in auth) return auth.error;

  const { data: card } = await auth.supabase
    .from('player_cards')
    .select('token, issued_at, revoked_at')
    .eq('player_id', id)
    .is('revoked_at', null)
    .maybeSingle();

  return NextResponse.json({
    nickname: auth.player.nickname,
    activeCard: card
      ? { token: card.token as string, issuedAt: card.issued_at as string }
      : null,
  });
}

export async function POST(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const auth = await requireCoach(_request, id);
  if ('error' in auth) return auth.error;

  await auth.supabase
    .from('player_cards')
    .update({ revoked_at: new Date().toISOString() })
    .eq('player_id', id)
    .is('revoked_at', null);

  const { data: created, error } = await auth.supabase
    .from('player_cards')
    .insert({
      organization_id: auth.orgId,
      player_id: id,
    })
    .select('token, issued_at')
    .single();

  if (error || !created) {
    return NextResponse.json({ error: 'Gagal menerbitkan kartu. Coba lagi.' }, { status: 500 });
  }

  return NextResponse.json({
    token: created.token as string,
    issuedAt: created.issued_at as string,
  });
}
