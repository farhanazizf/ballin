import { UserCircle } from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCoachTeamIds } from '@/lib/queries/dashboard';
import { getTeamsForCoach } from '@/lib/queries/sessions';
import { EmptyState } from '@/components/ui/empty-state';
import { SessionFormClient } from './session-form-client';

export default async function NewSessionPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ProfileError
        title="Sesi belum aktif"
        description="Masuk ulang dengan akun coach untuk membuat sesi latihan."
      />
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <ProfileError
        title="Profil belum lengkap"
        description="Akun Anda belum terhubung ke organisasi. Hubungi admin Dynasty untuk aktivasi."
      />
    );
  }

  const teamIds =
    profile.role === 'admin' ? [] : await getCoachTeamIds(supabase, user.id);

  const teams = await getTeamsForCoach(
    supabase,
    profile.organization_id,
    teamIds,
  );

  if (teams.length === 0) {
    return (
      <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
        <EmptyState
          icon={<UserCircle size={28} weight="duotone" />}
          title="Belum ada kelas ditugaskan"
          description="Hubungi admin untuk ditugaskan ke kelas sebelum membuat sesi latihan."
          theme="report"
        />
      </div>
    );
  }

  return <SessionFormClient teams={teams} />;
}

function ProfileError({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8">
      <EmptyState
        icon={<UserCircle size={28} weight="duotone" />}
        title={title}
        description={description}
        theme="report"
      />
    </div>
  );
}
