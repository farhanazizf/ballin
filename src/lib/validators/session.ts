import { z } from 'zod/v4';
import type { ValidationLocale } from '@/lib/i18n/messages';

export function createSessionSchema(v: ValidationLocale['session']) {
  return z.object({
    teamId: z.string().uuid(v.teamRequired),
    scheduledStart: z.iso.datetime(),
    scheduledEnd: z.iso.datetime().optional(),
    location: z.string().optional(),
    sessionType: z.enum(['training', 'benchmark']).default('training'),
  });
}

export function createRecurringSessionSchema(v: ValidationLocale['session']) {
  return z.object({
    teamId: z.string().uuid(v.teamRequired),
    daysOfWeek: z
      .array(z.number().int().min(1).max(7))
      .min(1, v.daysRequired),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, v.timeFormat),
    horizonWeeks: z.number().int().min(1).max(26).default(8),
    location: z.string().optional(),
    sessionType: z.enum(['training', 'benchmark']).default('training'),
  });
}

export function createSessionCancelSchema(v: ValidationLocale['session']) {
  return z.object({
    cancelReason: z.string().min(1, v.cancelReasonRequired).max(500),
  });
}

const defaultSessionMessages: ValidationLocale['session'] = {
  teamRequired: 'Kelas wajib dipilih',
  daysRequired: 'Pilih minimal satu hari latihan',
  timeFormat: 'Format waktu HH:mm',
  cancelReasonRequired: 'Alasan pembatalan wajib diisi',
  startRequired: 'Waktu mulai wajib diisi',
  invalidData: 'Data sesi tidak valid. Periksa kelas dan waktu mulai.',
};

export const sessionSchema = createSessionSchema(defaultSessionMessages);
export const recurringSessionSchema = createRecurringSessionSchema(defaultSessionMessages);
export const sessionCancelSchema = createSessionCancelSchema(defaultSessionMessages);

export type SessionInput = z.infer<ReturnType<typeof createSessionSchema>>;
export type RecurringSessionInput = z.infer<ReturnType<typeof createRecurringSessionSchema>>;
export type SessionCancelInput = z.infer<ReturnType<typeof createSessionCancelSchema>>;

export const attendanceSchema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().uuid(),
  status: z.enum(['present', 'late', 'excused', 'sick', 'absent']),
  method: z.enum(['qr', 'manual', 'auto', 'kiosk']).default('manual'),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
