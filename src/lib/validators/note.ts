import { z } from 'zod/v4';
import { idSchema } from '@/lib/validators/id';

export const noteKindSchema = z.enum(['praise', 'improvement', 'observation']);

export const playerNoteSchema = z.object({
  playerId: idSchema,
  sessionId: idSchema.optional(),
  note: z.string().trim().min(1, 'Catatan wajib diisi'),
  kind: noteKindSchema.default('observation'),
});

export const sessionNotesSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
});

export type PlayerNoteInput = z.infer<typeof playerNoteSchema>;
export type SessionNotesInput = z.infer<typeof sessionNotesSchema>;
