import { z } from 'zod/v4';

/**
 * Accepts standard UUID-shaped strings, including dev seed IDs that omit RFC version bits.
 * Supabase/Postgres accept these; strict z.uuid() rejects them.
 */
export const idSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'ID tidak valid',
  );

export type Id = z.infer<typeof idSchema>;
