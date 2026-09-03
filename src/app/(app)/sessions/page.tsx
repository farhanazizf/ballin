import type { SupabaseClient } from '@supabase/supabase-js';
import { CalendarDots } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getSessionsList, getTeamsForCoach } from '@/lib/queries/sessions';
import { EmptyState } from '@/components/ui/empty-state';
import { SessionsClient } from './sessions-client';

export default async function SessionsPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={<CalendarDots size={28} weight="duotone" />}
          title="Sesi belum aktif"
          description="Masuk ulang dengan akun coach untuk melihat jadwal latihan."
          theme="report"
        />
      </PageShell>
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <PageShell>
        <EmptyState
          icon={<CalendarDots size={28} weight="duotone" />}
          title="Profil belum lengkap"
          description="Akun Anda belum terhubung ke organisasi."
          theme="report"
        />
      </PageShell>
    );
  }

  const teamIds =
    profile.role === 'admin' ? [] : await getCoachTeamIds(supabase, user.id);

  const [sessions, teams] = await Promise.all([
    getSessionsList(supabase, profile.organization_id, teamIds),
    getTeamsForCoach(supabase, profile.organization_id, teamIds),
  ]);

  return (
    <PageShell>
      <SessionsClient sessions={sessions} teams={teams} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">{children}</div>
  );
}
