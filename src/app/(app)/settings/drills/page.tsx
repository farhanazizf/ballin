import type { SupabaseClient } from '@supabase/supabase-js';
import { Barbell } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';
import { getServerMessages } from '@/lib/i18n/server';
import { DrillsSettingsClient, type DrillRow } from './drills-settings-client';

export default async function DrillsSettingsPage() {
  const t = await getServerMessages();
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <EmptyState
          icon={<Barbell size={28} weight="duotone" />}
          title={t.common.sessionInactive}
          description={t.settings.drills.inactiveDesc}
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
          icon={<Barbell size={28} weight="duotone" />}
          title={t.common.profileIncomplete}
          description={t.settings.drills.profileIncompleteDesc}
          theme="report"
        />
      </Shell>
    );
  }

  const { data: drills } = await supabase
    .from('drills')
    .select('id, name, category, type, default_target, unit, is_archived')
    .eq('organization_id', profile.organization_id)
    .eq('is_archived', false)
    .order('category')
    .order('name');

  const rows: DrillRow[] = (drills ?? []).map((drill) => ({
    id: drill.id,
    name: drill.name,
    category: drill.category,
    type: drill.type,
    defaultTarget: drill.default_target,
    unit: drill.unit,
    isArchived: drill.is_archived,
  }));

  return (
    <Shell>
      <p className="brut-label text-[var(--color-hazard)]">{t.settings.drills.badge}</p>
      <h1 className="brut-heading mt-2 text-2xl text-[var(--color-report-text)] mb-6">
        {t.settings.drills.title}
      </h1>
      <DrillsSettingsClient
        drills={rows}
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
