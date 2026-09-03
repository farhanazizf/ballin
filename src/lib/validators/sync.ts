import { z } from 'zod/v4';

export const syncEventSchema = z.object({
  clientEventId: z.string().uuid(),
  sessionDrillId: z.string().uuid(),
  playerId: z.string().uuid(),
  result: z.enum(['made', 'miss', 'dnp']),
  value: z.number().optional(),
  occurredAt: z.iso.datetime(),
  deviceId: z.string().min(1),
  recordedBy: z.string().uuid(),
});

export const syncEventsBatchSchema = z.object({
  events: z.array(syncEventSchema).min(1).max(50),
});

export const syncAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().uuid(),
  sessionDate: z.iso.date(),
  status: z.enum(['present', 'late', 'excused', 'sick', 'absent']),
  method: z.enum(['qr', 'manual', 'auto', 'kiosk']),
  checkedInAt: z.iso.datetime(),
  recordedBy: z.string().uuid(),
});

export const syncAttendanceBatchSchema = z.object({
  records: z.array(syncAttendanceSchema).min(1).max(50),
});

export type SyncEvent = z.infer<typeof syncEventSchema>;
export type SyncAttendance = z.infer<typeof syncAttendanceSchema>;
