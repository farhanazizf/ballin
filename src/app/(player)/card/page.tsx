import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/ui/empty-state';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getServerMessages } from '@/lib/i18n/server';
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
  const t = await getServerMessages();
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
        title={t.player.card.profileNotLinked.title}
        description={t.player.card.profileNotLinked.description}
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
        title={t.player.card.notFound.title}
        description={t.player.card.notFound.description}
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
