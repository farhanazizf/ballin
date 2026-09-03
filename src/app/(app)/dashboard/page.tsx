import { UserCircle } from '@phosphor-icons/react/dist/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAttentionPlayers,
  getCoachTeamIds,
  getDrillDistribution,
  getUpcomingSession,
  getWeeklyAttendance,
} from '@/lib/queries/dashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ProfileError
        title="Sesi belum aktif"
        description="Masuk ulang dengan akun coach untuk melihat dashboard."
      />
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name, role')
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

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', profile.organization_id)
    .maybeSingle();

  if (!organization) {
    return (
      <ProfileError
        title="Organisasi tidak ditemukan"
        description="Data akademi tidak tersedia. Periksa koneksi atau hubungi admin jika masalah berlanjut."
      />
    );
  }

  const teamIds = await getCoachTeamIds(supabase, user.id);

  let teamName = 'Semua kelas';
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from('teams')
      .select('name')
      .in('id', teamIds)
      .order('name', { ascending: true })
      .limit(1);
    teamName = teams?.[0]?.name ?? teamName;
  }

  const [upcomingSession, attendance, attentionPlayers, drillDistribution] =
    await Promise.all([
      getUpcomingSession(supabase, profile.organization_id),
      getWeeklyAttendance(supabase, profile.organization_id, teamIds),
      getAttentionPlayers(supabase, profile.organization_id),
      getDrillDistribution(supabase, profile.organization_id, new Date()),
    ]);

  return (
    <DashboardClient
      orgName={organization.name}
      teamName={teamName}
      upcomingSession={upcomingSession}
      attendance={attendance}
      attentionPlayers={attentionPlayers}
      drillDistribution={drillDistribution}
    />
  );
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
