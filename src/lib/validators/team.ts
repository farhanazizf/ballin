import { z } from 'zod/v4';
import type { ValidationLocale } from '@/lib/i18n/messages';

function refineAgeRange<T extends z.ZodTypeAny>(schema: T, message: string) {
  return schema.refine(
    (data) => {
      const { ageMin, ageMax } = data as { ageMin?: number | null; ageMax?: number | null };
      if (ageMin == null || ageMax == null) return true;
      return ageMin <= ageMax;
    },
    { message, path: ['ageMax'] },
  );
}

export function createTeamSchema(v: ValidationLocale['team']) {
  const base = z.object({
    name: z.string().min(1, v.nameRequired),
    ageMin: z.number().int().min(0).max(99).nullable().optional(),
    ageMax: z.number().int().min(0).max(99).nullable().optional(),
    trackDrillStats: z.boolean().default(true),
    isActive: z.boolean().default(true),
  });
  return refineAgeRange(base, v.ageRangeInvalid);
}

const defaultTeamMessages: ValidationLocale['team'] = {
  nameRequired: 'Nama kelas wajib diisi',
  ageRangeInvalid: 'Usia minimum tidak boleh lebih besar dari usia maksimum',
  invalidData: 'Data kelas tidak valid.',
};

export const teamSchema = createTeamSchema(defaultTeamMessages);

export type TeamInput = z.infer<ReturnType<typeof createTeamSchema>>;

export function createTeamUpdateSchema(v: ValidationLocale['team']) {
  const base = z.object({
    name: z.string().min(1, v.nameRequired).optional(),
    ageMin: z.number().int().min(0).max(99).nullable().optional(),
    ageMax: z.number().int().min(0).max(99).nullable().optional(),
    trackDrillStats: z.boolean().optional(),
    isActive: z.boolean().optional(),
  });
  return refineAgeRange(base, v.ageRangeInvalid);
}

export const teamUpdateSchema = createTeamUpdateSchema(defaultTeamMessages);

export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
