import { z } from 'zod/v4';
import { idSchema } from './id';
import type { ValidationLocale } from '@/lib/i18n/messages';

export function createStationInputSchema(v: ValidationLocale['station']) {
  return z.object({
    label: z.string().trim().min(1, v.labelRequired).max(40),
    coachId: idSchema.optional(),
    playerIds: z.array(idSchema).max(20),
  });
}

export function createSaveStationsSchema(v: ValidationLocale['station']) {
  return z.object({
    stations: z.array(createStationInputSchema(v)).min(1).max(8),
  });
}

const defaultStationMessages: ValidationLocale['station'] = {
  labelRequired: 'Nama pos wajib diisi.',
};

export const stationInputSchema = createStationInputSchema(defaultStationMessages);
export const saveStationsSchema = createSaveStationsSchema(defaultStationMessages);

export type SaveStationsInput = z.infer<ReturnType<typeof createSaveStationsSchema>>;
