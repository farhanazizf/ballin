import { z } from 'zod/v4';

export const syncEventSchema = z.object({
  clientEventId: z.uuid(),
  sessionDrillId: z.uuid(),
  playerId: z.uuid(),
  result: z.enum(['made', 'miss', 'dnp']),
  value: z.number().optional(),
  occurredAt: z.iso.datetime(),
  deviceId: z.string().min(1),
  recordedBy: z.uuid(),
});

export const syncEventsBatchSchema = z.object({
  events: z.array(syncEventSchema).min(1).max(50),
});

export type SyncEventInput = z.infer<typeof syncEventSchema>;
export type SyncEventsBatchInput = z.infer<typeof syncEventsBatchSchema>;
