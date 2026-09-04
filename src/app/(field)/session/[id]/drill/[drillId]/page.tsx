import { Suspense } from 'react';
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

  return (
    <Suspense fallback={<div className="p-4 text-[var(--color-field-text-3)]">Menyiapkan drill...</div>}>
      <DrillClient sessionId={id} drillId={drillId} coachId={user.id} />
    </Suspense>
  );
}
