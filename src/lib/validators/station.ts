import { z } from 'zod/v4';
import { idSchema } from './id';

export const stationInputSchema = z.object({
  label: z.string().trim().min(1, 'Nama pos wajib diisi.').max(40),
  coachId: idSchema.optional(),
  playerIds: z.array(idSchema).max(20),
});

export const saveStationsSchema = z.object({
  stations: z.array(stationInputSchema).min(1).max(8),
});

export type SaveStationsInput = z.infer<typeof saveStationsSchema>;
