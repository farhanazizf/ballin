import { z } from 'zod/v4';
import { idSchema } from '@/lib/validators/id';

export const rubricScoreSchema = z.object({
  playerId: idSchema,
  effort: z.number().int().min(1).max(5).nullable().optional(),
  coachability: z.number().int().min(1).max(5).nullable().optional(),
  discipline: z.number().int().min(1).max(5).nullable().optional(),
});

export const rubricBatchSchema = z.object({
  scores: z.array(rubricScoreSchema).min(1).max(15),
});

export type RubricScoreInput = z.infer<typeof rubricScoreSchema>;
export type RubricBatchInput = z.infer<typeof rubricBatchSchema>;
