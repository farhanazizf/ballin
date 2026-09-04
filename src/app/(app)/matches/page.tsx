import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getMatchesForCoach } from '@/lib/queries/matches';
import { getTeamsForCoach } from '@/lib/queries/sessions';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { MatchesClient } from './matches-client';

export default async function MatchesPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle();
  if (!profile?.organization_id) return null;

  const teamIds = await getCoachTeamIds(supabase, user.id);
  const [matches, teams] = await Promise.all([
    getMatchesForCoach(supabase, profile.organization_id, user.id),
    getTeamsForCoach(supabase, profile.organization_id, teamIds),
  ]);

  return <MatchesClient matches={matches} teams={teams} />;
}
