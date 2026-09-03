import type { SupabaseClient } from '@supabase/supabase-js';
import { UsersThree } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getPlayersList } from '@/lib/queries/players';
import { EmptyState } from '@/components/ui/empty-state';
import { PlayersListClient } from './players-client';

export default async function PlayersPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          icon={<UsersThree size={28} weight="duotone" />}
          title="Sesi belum aktif"
          description="Masuk ulang dengan akun coach untuk melihat daftar pemain."
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
          icon={<UsersThree size={28} weight="duotone" />}
          title="Profil belum lengkap"
          description="Akun Anda belum terhubung ke organisasi. Hubungi admin Dynasty."
          theme="report"
        />
      </PageShell>
    );
  }

  const teamIds =
    profile.role === 'admin' ? [] : await getCoachTeamIds(supabase, user.id);
  const players = await getPlayersList(supabase, profile.organization_id, teamIds);

  return (
    <PageShell>
      <PlayersListClient players={players} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">{children}</div>
  );
}
