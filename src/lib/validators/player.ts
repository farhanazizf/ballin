import { z } from 'zod/v4';

export const playerSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap wajib diisi'),
  nickname: z.string().min(1, 'Nama panggilan wajib diisi'),
  birthDate: z.iso.date('Tanggal lahir tidak valid'),
  jerseyNumber: z.number().int().min(0).max(99).optional(),
  position: z.string().optional(),
  dominantHand: z.enum(['left', 'right', 'both']).optional(),
  school: z.string().optional(),
  photoPath: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  consentGivenBy: z.string().optional(),
  teamIds: z.array(z.string().uuid()).min(1, 'Pilih minimal satu kelas'),
});

export type PlayerInput = z.infer<typeof playerSchema>;

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
