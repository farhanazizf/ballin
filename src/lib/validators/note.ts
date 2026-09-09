import { z } from 'zod/v4';
import { idSchema } from '@/lib/validators/id';
import type { ValidationLocale } from '@/lib/i18n/messages';

export const noteKindSchema = z.enum(['praise', 'improvement', 'observation']);

export function createPlayerNoteSchema(v: ValidationLocale['note']) {
  return z.object({
    playerId: idSchema,
    sessionId: idSchema.optional(),
    note: z.string().trim().min(1, v.noteRequired),
    kind: noteKindSchema.default('observation'),
  });
}

const defaultNoteMessages: ValidationLocale['note'] = {
  noteRequired: 'Catatan wajib diisi',
};

export const playerNoteSchema = createPlayerNoteSchema(defaultNoteMessages);

export const sessionNotesSchema = z.object({
  notes: z.string().trim().max(2000).optional(),
});

export type PlayerNoteInput = z.infer<ReturnType<typeof createPlayerNoteSchema>>;
export type SessionNotesInput = z.infer<typeof sessionNotesSchema>;
