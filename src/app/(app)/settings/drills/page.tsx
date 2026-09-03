import type { SupabaseClient } from '@supabase/supabase-js';
import { Barbell } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

export default async function DrillsSettingsPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <EmptyState title="Sesi belum aktif" description="Masuk ulang untuk melihat drill." theme="report" />
      </Shell>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <Shell>
        <EmptyState title="Profil belum lengkap" description="Hubungi admin Dynasty." theme="report" />
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

  return (
    <Shell>
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-report-text)] mb-6">
        Drill library
      </h1>
      <ul className="space-y-2">
        {(drills ?? []).map((drill) => (
          <li
            key={drill.id}
            className={cn(
              'rounded-[var(--radius-panel)] border border-[var(--color-report-border)]',
              'bg-[var(--color-report-surface)] px-4 py-4',
            )}
          >
            <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-report-text)]">
              {drill.name}
            </p>
            <p className="text-sm text-[var(--color-report-text-3)] mt-1">
              {drill.category} · {drill.type}
              {drill.default_target != null ? ` · target ${drill.default_target}` : ''}
              {drill.unit ? ` ${drill.unit}` : ''}
            </p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">{children}</div>;
}
