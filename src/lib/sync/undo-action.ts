export type OutboxStatus = 'pending' | 'sending' | 'sent' | 'failed';

/**
 * Decide how to undo a local drill event based on outbox status.
 * Pending/failed/missing never reached the server — delete locally.
 * Sent or in-flight must be voided so the server count stays correct.
 */
export function classifyUndoAction(status: OutboxStatus | undefined): 'delete' | 'void' {
  if (status === 'sent' || status === 'sending') return 'void';
  return 'delete';
}
