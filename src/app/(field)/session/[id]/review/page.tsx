import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ReviewClient } from './review-client';

type Props = { params: Promise<{ id: string }> };

export default async function SessionReviewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <ReviewClient sessionId={id} coachId={user.id} />;
}
