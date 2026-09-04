import { z } from 'zod/v4';
import { idSchema } from './id';

export const syncEventSchema = z.object({
  clientEventId: z.string().uuid(),
  sessionDrillId: idSchema,
  playerId: idSchema,
  result: z.enum(['made', 'miss', 'dnp']),
  value: z.number().optional(),
  occurredAt: z.iso.datetime(),
  deviceId: z.string().min(1),
  recordedBy: idSchema,
});

export const syncEventsBatchSchema = z.object({
  events: z.array(syncEventSchema).min(1).max(50),
});

export const syncAttendanceSchema = z.object({
  sessionId: idSchema,
  playerId: idSchema,
  sessionDate: z.iso.date(),
  status: z.enum(['present', 'late', 'excused', 'sick', 'absent']),
  method: z.enum(['qr', 'manual', 'auto', 'kiosk']),
  checkedInAt: z.iso.datetime(),
  recordedBy: idSchema,
});

export const syncAttendanceBatchSchema = z.object({
  records: z.array(syncAttendanceSchema).min(1).max(50),
});

export type SyncEvent = z.infer<typeof syncEventSchema>;
export type SyncAttendance = z.infer<typeof syncAttendanceSchema>;

export const syncResultSchema = z
  .object({
    sessionDrillId: idSchema,
    playerId: idSchema,
    made: z.number().int().min(0),
    attempts: z.number().int().min(0),
    isDnp: z.boolean(),
  })
  .refine((data) => data.isDnp || data.attempts >= data.made, {
    message: 'Made tidak boleh lebih besar dari attempts',
    path: ['made'],
  });

export const syncResultsBatchSchema = z.object({
  results: z.array(syncResultSchema).min(1).max(50),
});

export type SyncResult = z.infer<typeof syncResultSchema>;
