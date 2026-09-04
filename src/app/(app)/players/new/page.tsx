import type { SupabaseClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getTeamsForCoach } from '@/lib/queries/sessions';
import { PlayerFormClient } from '../player-form-client';

export default async function NewPlayerPage() {
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
    redirect('/players');
  }

  const coachTeamIds = await getCoachTeamIds(supabase, user.id);
  const teams = await getTeamsForCoach(supabase, profile.organization_id, coachTeamIds);

  return (
    <PlayerFormClient
      mode="create"
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
