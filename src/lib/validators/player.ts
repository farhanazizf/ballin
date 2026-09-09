import { z } from 'zod/v4';
import type { ValidationLocale } from '@/lib/i18n/messages';

export function createPlayerSchema(v: ValidationLocale['player']) {
  return z.object({
    fullName: z.string().min(1, v.fullNameRequired),
    nickname: z.string().min(1, v.nicknameRequired),
    birthDate: z.iso.date(v.birthDateInvalid),
    jerseyNumber: z.number().int().min(0).max(99).optional(),
    position: z.string().optional(),
    dominantHand: z.enum(['left', 'right', 'both']).optional(),
    school: z.string().optional(),
    photoPath: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    consentGivenBy: z.string().optional(),
    teamIds: z.array(z.string().uuid()).min(1, v.teamRequired),
  });
}

const defaultPlayerMessages: ValidationLocale['player'] = {
  fullNameRequired: 'Nama lengkap wajib diisi',
  nicknameRequired: 'Nama panggilan wajib diisi',
  birthDateInvalid: 'Tanggal lahir tidak valid',
  teamRequired: 'Pilih minimal satu kelas',
  invalidData: 'Data pemain tidak valid.',
};

export const playerSchema = createPlayerSchema(defaultPlayerMessages);

export type PlayerInput = z.infer<ReturnType<typeof createPlayerSchema>>;

export const playerUpdateSchema = playerSchema.partial().extend({
  status: z.enum(['active', 'inactive']).optional(),
});

export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;

export const playerMeasurementSchema = z.object({
  playerId: z.string().uuid(),
  measuredOn: z.iso.date(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  wingspanCm: z.number().positive().optional(),
  standingReachCm: z.number().positive().optional(),
});

export type PlayerMeasurementInput = z.infer<typeof playerMeasurementSchema>;
