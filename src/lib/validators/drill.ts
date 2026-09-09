import { z } from 'zod/v4';
import type { ValidationLocale } from '@/lib/i18n/messages';

export function createDrillSchema(v: ValidationLocale['drill']) {
  return z.object({
    name: z.string().min(1, v.nameRequired),
    category: z.enum([
      'Shooting',
      'Finishing',
      'Ballhandling',
      'Defense',
      'Athleticism',
      'Conditioning',
    ]),
    type: z.enum(['attempt', 'timed', 'count_in_time', 'measure', 'rating']),
    defaultTarget: z.number().int().positive().optional(),
    unit: z.string().optional(),
    lowerIsBetter: z.boolean().default(false),
    attributeWeights: z.record(z.string(), z.number().min(0).max(1)).default({}),
    instructions: z.string().optional(),
    videoUrl: z.url().optional(),
  });
}

const defaultDrillMessages: ValidationLocale['drill'] = {
  nameRequired: 'Nama drill wajib diisi',
  invalidData: 'Data drill tidak valid.',
};

export const drillSchema = createDrillSchema(defaultDrillMessages);

export type DrillInput = z.infer<ReturnType<typeof createDrillSchema>>;

export const drillUpdateSchema = drillSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type DrillUpdateInput = z.infer<typeof drillUpdateSchema>;

export const drillEventSchema = z.object({
  sessionDrillId: z.string().uuid(),
  playerId: z.string().uuid(),
  result: z.enum(['made', 'miss', 'dnp']),
  value: z.number().optional(),
});

export type DrillEventInput = z.infer<typeof drillEventSchema>;
