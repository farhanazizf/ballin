import { z } from 'zod/v4';
import { idSchema } from '@/lib/validators/id';
import type { ValidationLocale } from '@/lib/i18n/messages';

export function createMatchInputSchema(v: ValidationLocale['match']) {
  return z.object({
    teamId: idSchema,
    opponent: z.string().trim().min(1, v.opponentRequired),
    matchType: z.enum(['friendly', 'league', 'tournament']).default('friendly'),
    playedAt: z.string().datetime({ offset: true }),
    location: z.string().trim().optional(),
    scoreFor: z.number().int().min(0).nullable().optional(),
    scoreAgainst: z.number().int().min(0).nullable().optional(),
    notes: z.string().trim().max(1000).optional(),
  });
}

const defaultMatchMessages: ValidationLocale['match'] = {
  opponentRequired: 'Nama lawan wajib diisi',
};

export const matchInputSchema = createMatchInputSchema(defaultMatchMessages);

export const boxScoreRowSchema = z.object({
  playerId: idSchema,
  minutes: z.number().int().min(0).max(48).nullable().optional(),
  points: z.number().int().min(0).nullable().optional(),
  fgm: z.number().int().min(0).nullable().optional(),
  fga: z.number().int().min(0).nullable().optional(),
  tpm: z.number().int().min(0).nullable().optional(),
  tpa: z.number().int().min(0).nullable().optional(),
  ftm: z.number().int().min(0).nullable().optional(),
  fta: z.number().int().min(0).nullable().optional(),
  oreb: z.number().int().min(0).nullable().optional(),
  dreb: z.number().int().min(0).nullable().optional(),
  assists: z.number().int().min(0).nullable().optional(),
  steals: z.number().int().min(0).nullable().optional(),
  blocks: z.number().int().min(0).nullable().optional(),
  turnovers: z.number().int().min(0).nullable().optional(),
  fouls: z.number().int().min(0).nullable().optional(),
});

export const boxScoreBatchSchema = z.object({
  rows: z.array(boxScoreRowSchema).min(1).max(20),
});

export type MatchInput = z.infer<ReturnType<typeof createMatchInputSchema>>;
export type BoxScoreBatchInput = z.infer<typeof boxScoreBatchSchema>;
