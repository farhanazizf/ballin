import type { SupabaseClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getTeamsForCoach } from '@/lib/queries/sessions';
import { getPlayerForEdit } from '@/lib/queries/players';
import { PlayerFormClient, toFormValues } from '../../player-form-client';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPlayerPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id || !['admin', 'coach'].includes(profile.role)) {
    redirect(`/players/${id}`);
  }

  const player = await getPlayerForEdit(supabase, id);
  if (!player) notFound();

  const coachTeamIds = await getCoachTeamIds(supabase, user.id);
  const teams = await getTeamsForCoach(supabase, profile.organization_id, coachTeamIds);

  return (
    <PlayerFormClient
      mode="edit"
      playerId={id}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      initial={toFormValues(player)}
    />
  );
}
