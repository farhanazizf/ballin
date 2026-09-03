import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DrillClient } from './drill-client';

type Props = { params: Promise<{ id: string; drillId: string }> };

export default async function DrillPage({ params }: Props) {
  const { id, drillId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <DrillClient sessionId={id} drillId={drillId} coachId={user.id} />;
}
