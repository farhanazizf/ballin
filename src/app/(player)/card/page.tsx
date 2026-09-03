import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  buildRadarData,
  getAttendanceStreak,
  getPersonalBests,
  getPlayerBadges,
  getPlayerCard,
  getPlayerIdForProfile,
  getRecentDrills,
  getRecentSessionDots,
} from '@/lib/queries/player-card';
import { PlayerCardClient } from './card-client';

export default async function PlayerCardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/player-login');
  }

  const playerId = await getPlayerIdForProfile(user.id);

  if (!playerId) {
    return (
      <EmptyState
        theme="field"
        icon={<WarningCircle size={28} weight="duotone" />}
        title="Profil pemain belum terhubung"
        description="Hubungi coach atau admin akademi untuk menghubungkan akun login dengan data pemainmu."
      />
    );
  }

  const [card, streak, recentSessions, recentDrills, personalBests, badges] =
    await Promise.all([
      getPlayerCard(playerId),
      getAttendanceStreak(playerId),
      getRecentSessionDots(playerId, 8),
      getRecentDrills(playerId),
      getPersonalBests(playerId),
      getPlayerBadges(playerId),
    ]);

  if (!card) {
    return (
      <EmptyState
        theme="field"
        icon={<WarningCircle size={28} weight="duotone" />}
        title="Data pemain tidak ditemukan"
        description="Coba keluar lalu masuk lagi. Jika masalah berlanjut, hubungi coach."
      />
    );
  }

  const radarData = buildRadarData(card.currentShape, card.previousShape);

  return (
    <PlayerCardClient
      card={card}
      streak={streak}
      recentSessions={recentSessions}
      radarData={radarData}
      recentDrills={recentDrills}
      personalBests={personalBests}
      badges={badges}
    />
  );
}
