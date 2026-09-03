import { enqueue } from '@/lib/sync/outbox';
import type { AttendanceMethod, AttendanceSetupSession, AttendanceStatus } from '@/lib/attendance/types';
import { createClient } from '@/lib/supabase/client';

export type AttendanceRecordInput = {
  session: AttendanceSetupSession;
  playerId: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
};

export type AttendanceRecordResult =
  | { ok: true; queued: boolean }
  | { ok: false; message: string };

export async function recordAttendance(input: AttendanceRecordInput): Promise<AttendanceRecordResult> {
  const clientEventId = crypto.randomUUID();
  const checkedInAt = new Date().toISOString();

  const payload = {
    clientEventId,
    sessionId: input.session.id,
    playerId: input.playerId,
    sessionDate: input.session.sessionDate,
    status: input.status,
    method: input.method,
    checkedInAt,
  };

  if (!navigator.onLine) {
    await enqueue({
      clientEventId,
      table: 'attendance',
      payload,
    });
    return { ok: true, queued: true };
  }

  const supabase = createClient();
  const { error } = await supabase.from('attendance').upsert(
    {
      session_id: input.session.id,
      player_id: input.playerId,
      session_date: input.session.sessionDate,
      status: input.status,
      checked_in_at: checkedInAt,
      method: input.method,
    },
    { onConflict: 'session_id,player_id' },
  );

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        message: 'Pemain sudah tercatat hadir di sesi lain hari ini.',
      };
    }

    await enqueue({
      clientEventId,
      table: 'attendance',
      payload,
    });
    return { ok: true, queued: true };
  }

  return { ok: true, queued: false };
}
