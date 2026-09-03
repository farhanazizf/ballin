import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionById } from '@/lib/queries/sessions';
import { getSessionDate } from '@/lib/attendance/session-date';
import { AttendanceClient } from './attendance-client';

type Props = { params: Promise<{ id: string }> };

export default async function AttendancePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const session = await getSessionById(supabase, id);
  if (!session) redirect('/sessions');

  const sessionDate = getSessionDate(session.scheduledStart);

  return (
    <AttendanceClient
      sessionId={id}
      sessionDate={sessionDate}
      teamName={session.teamName}
      coachId={user.id}
    />
  );
}
