import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getReportsForOrg } from '@/lib/queries/reports';
import { getPlayersForOrg } from '@/lib/queries/players';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { ReportsClient } from './reports-client';

export default async function ReportsPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).maybeSingle();
  if (!profile?.organization_id) return null;

  const teamIds = await getCoachTeamIds(supabase, user.id);
  const [reports, players] = await Promise.all([
    getReportsForOrg(supabase, profile.organization_id),
    getPlayersForOrg(supabase, profile.organization_id, teamIds),
  ]);

  return (
    <ReportsClient
      reports={reports}
      players={players.map((p) => ({ id: p.id, name: p.nickname || p.fullName }))}
    />
  );
}
