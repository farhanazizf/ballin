import { z } from 'zod/v4';

export const drillSchema = z.object({
  name: z.string().min(1, 'Nama drill wajib diisi'),
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

export type DrillInput = z.infer<typeof drillSchema>;

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
