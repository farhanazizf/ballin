import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPlayerDetail } from '@/lib/queries/players';
import { PlayerDetailClient } from './player-detail-client';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = (await createServerSupabaseClient()) as SupabaseClient;
  const player = await getPlayerDetail(supabase, id);
  if (!player) notFound();

  return (
    <div className="min-h-[100dvh] px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
      <Link
        href="/players"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-report-text-3)] hover:text-[var(--color-report-text)] mb-6 font-[family-name:var(--font-ui)]"
      >
        <ArrowLeft size={16} />
        Kembali ke pemain
      </Link>
      <PlayerDetailClient player={player} />
    </div>
  );
}
