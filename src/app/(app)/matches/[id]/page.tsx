import { notFound } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getMatchBoxScores, getMatchDetail } from '@/lib/queries/matches';
import { BoxScoreClient } from './box-score-client';

type Props = { params: Promise<{ id: string }> };

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const [match, rows] = await Promise.all([
    getMatchDetail(supabase, id),
    getMatchBoxScores(supabase, id),
  ]);
  if (!match) notFound();
  return <BoxScoreClient match={match} initialRows={rows} />;
}
