import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CloseClient } from './close-client';

type Props = { params: Promise<{ id: string }> };

export default async function SessionClosePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <CloseClient sessionId={id} />;
}
