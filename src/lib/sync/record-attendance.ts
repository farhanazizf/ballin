import { db } from '@/lib/db';
import { getSessionDate } from '@/lib/attendance/session-date';
import { isPresentStatus } from '@/lib/attendance/status';
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
  return isPresentStatus(row.status);
}

/** First non-DNP drill event marks the player hadir (B3 AC4). */
export async function ensurePresentFromDrill(input: {
  sessionDrillId: string;
  playerId: string;
  recordedBy: string;
  result: 'made' | 'miss' | 'dnp';
}) {
  if (input.result === 'dnp') return;

  const sessionDrill = await db.sessionDrills.get(input.sessionDrillId);
  if (!sessionDrill) return;

  const existing = await db.localAttendance.get(`${sessionDrill.sessionId}:${input.playerId}`);
  if (existing && isPresentStatus(existing.status)) return;

  const session = await db.sessions.get(sessionDrill.sessionId);
  const sessionDate = session
    ? getSessionDate(session.scheduledStart)
    : new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

  await markAttendanceLocal({
    sessionId: sessionDrill.sessionId,
    playerId: input.playerId,
    sessionDate,
    status: 'present',
    method: 'auto',
    recordedBy: input.recordedBy,
  });
}
