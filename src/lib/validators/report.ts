import { z } from 'zod/v4';
import { idSchema } from '@/lib/validators/id';

export const reportContentSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()),
  improvements: z.array(z.string()),
});

export const reportGenerateSchema = z.object({
  playerId: idSchema,
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const reportApproveSchema = z.object({
  content: reportContentSchema,
});

export type ReportContent = z.infer<typeof reportContentSchema>;
export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;
export type ReportApproveInput = z.infer<typeof reportApproveSchema>;
