import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionById } from '@/lib/queries/sessions';
import { StationsClient } from './stations-client';

type Props = { params: Promise<{ id: string }> };

export default async function StationsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const session = await getSessionById(supabase, id);
  if (!session) redirect('/sessions');

  return <StationsClient sessionId={id} teamName={session.teamName} />;
}
