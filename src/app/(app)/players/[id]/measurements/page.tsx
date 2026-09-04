import type { SupabaseClient } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPlayerDetail, getPlayerMeasurements } from '@/lib/queries/players';
import { MeasurementsClient } from './measurements-client';

type PageProps = { params: Promise<{ id: string }> };

export default async function PlayerMeasurementsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const player = await getPlayerDetail(supabase, id);
  if (!player) notFound();

  const measurements = await getPlayerMeasurements(supabase, id);

  return (
    <MeasurementsClient
      playerId={id}
      playerName={player.nickname}
      measurements={measurements}
    />
  );
}
