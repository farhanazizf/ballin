import { db } from '@/lib/db';
import { enqueue } from './outbox';

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'sick' | 'absent';

export interface MarkAttendanceInput {
  sessionId: string;
  playerId: string;
  sessionDate: string;
  status: AttendanceStatus;
  method: 'qr' | 'manual' | 'auto' | 'kiosk';
  recordedBy: string;
}

export async function markAttendanceLocal(input: MarkAttendanceInput) {
  const key = `${input.sessionId}:${input.playerId}`;
  const checkedInAt = new Date().toISOString();

  const row = {
    key,
    sessionId: input.sessionId,
    playerId: input.playerId,
    sessionDate: input.sessionDate,
    status: input.status,
    method: input.method,
    checkedInAt,
    recordedBy: input.recordedBy,
  };

  await db.transaction('rw', db.localAttendance, db.outbox, async () => {
    await db.localAttendance.put(row);
    await enqueue({
      clientEventId: crypto.randomUUID(),
      table: 'attendance',
      payload: {
        sessionId: input.sessionId,
        playerId: input.playerId,
        sessionDate: input.sessionDate,
        status: input.status,
        method: input.method,
        checkedInAt,
        recordedBy: input.recordedBy,
      },
    });
  });

  return row;
}

export async function isPlayerCheckedIn(sessionId: string, playerId: string): Promise<boolean> {
  const row = await db.localAttendance.get(`${sessionId}:${playerId}`);
  if (!row) return false;
  return row.status === 'present' || row.status === 'late';
}
