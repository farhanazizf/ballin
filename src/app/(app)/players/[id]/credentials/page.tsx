import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPlayerDetail } from '@/lib/queries/players';
import { getPlayerCredentialsView } from '@/lib/queries/player-credentials';
import { createAdminClient } from '@/lib/supabase/admin';
import { CredentialsClient } from './credentials-client';

type PageProps = { params: Promise<{ id: string }> };

export default async function PlayerCredentialsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !['admin', 'coach'].includes(profile.role)) {
    redirect(`/players/${id}`);
  }

  const player = await getPlayerDetail(supabase, id);
  if (!player) notFound();

  const admin = createAdminClient();
  const credentials = await getPlayerCredentialsView(admin, id);
  if (!credentials) notFound();

  return (
    <CredentialsClient
      playerId={id}
      playerName={player.nickname}
      initial={credentials}
    />
  );
}
