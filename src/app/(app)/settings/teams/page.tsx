import type { SupabaseClient } from '@supabase/supabase-js';
import { UsersThree } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';
import { getServerMessages } from '@/lib/i18n/server';
import { TeamsSettingsClient, type TeamRow } from './teams-settings-client';

export default async function TeamsSettingsPage() {
  const t = await getServerMessages();
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={t.common.sessionInactive}
          description={t.settings.teams.inactiveDesc}
          theme="report"
        />
      </Shell>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <Shell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title={t.common.profileIncomplete}
          description={t.settings.teams.profileIncompleteDesc}
          theme="report"
        />
      </Shell>
    );
  }

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, age_min, age_max, track_drill_stats, is_active')
    .eq('organization_id', profile.organization_id)
    .order('name');

  const rows: TeamRow[] = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    ageMin: team.age_min,
    ageMax: team.age_max,
    trackDrillStats: team.track_drill_stats,
    isActive: team.is_active,
  }));

  return (
    <Shell>
      <p className="brut-label text-[var(--color-hazard)]">{t.settings.teams.badge}</p>
      <h1 className="brut-heading mt-2 text-2xl text-[var(--color-report-text)] mb-6">
        {t.settings.teams.title}
      </h1>
      <TeamsSettingsClient
        teams={rows}
        canManage={profile.role === 'admin'}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] border-b-2 border-[var(--color-report-border)] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      {children}
    </div>
  );
}
