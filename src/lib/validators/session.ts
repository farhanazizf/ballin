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
