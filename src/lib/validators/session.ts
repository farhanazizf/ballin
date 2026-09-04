import { z } from 'zod/v4';

export const sessionSchema = z.object({
  teamId: z.string().uuid('Kelas wajib dipilih'),
  scheduledStart: z.iso.datetime(),
  scheduledEnd: z.iso.datetime().optional(),
  location: z.string().optional(),
  sessionType: z.enum(['training', 'benchmark']).default('training'),
});

export type SessionInput = z.infer<typeof sessionSchema>;

export const attendanceSchema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().uuid(),
  status: z.enum(['present', 'late', 'excused', 'sick', 'absent']),
  method: z.enum(['qr', 'manual', 'auto', 'kiosk']).default('manual'),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;


export const recurringSessionSchema = z.object({
  teamId: z.string().uuid('Kelas wajib dipilih'),
  daysOfWeek: z
    .array(z.number().int().min(1).max(7))
    .min(1, 'Pilih minimal satu hari latihan'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu HH:mm'),
  horizonWeeks: z.number().int().min(1).max(26).default(8),
  location: z.string().optional(),
  sessionType: z.enum(['training', 'benchmark']).default('training'),
});

export type RecurringSessionInput = z.infer<typeof recurringSessionSchema>;

export const sessionCancelSchema = z.object({
  cancelReason: z.string().min(1, 'Alasan pembatalan wajib diisi').max(500),
});

export type SessionCancelInput = z.infer<typeof sessionCancelSchema>;
