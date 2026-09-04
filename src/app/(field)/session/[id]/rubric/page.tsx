import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { RubricClient } from './rubric-client';

type Props = { params: Promise<{ id: string }> };

export default async function SessionRubricPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return <RubricClient sessionId={id} />;
}
