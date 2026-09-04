import { z } from 'zod/v4';

const teamBaseSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  ageMin: z.number().int().min(0).max(99).nullable().optional(),
  ageMax: z.number().int().min(0).max(99).nullable().optional(),
  trackDrillStats: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

function refineAgeRange<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (data) => {
      const { ageMin, ageMax } = data as { ageMin?: number | null; ageMax?: number | null };
      if (ageMin == null || ageMax == null) return true;
      return ageMin <= ageMax;
    },
    { message: 'Usia minimum tidak boleh lebih besar dari usia maksimum', path: ['ageMax'] },
  );
}

export const teamSchema = refineAgeRange(teamBaseSchema);

export type TeamInput = z.infer<typeof teamSchema>;

export const teamUpdateSchema = refineAgeRange(teamBaseSchema.partial());

export type TeamUpdateInput = z.infer<typeof teamUpdateSchema>;
