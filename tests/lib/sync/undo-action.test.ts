import { describe, expect, it } from 'vitest';
import { classifyUndoAction } from '@/lib/sync/undo-action';

describe('classifyUndoAction', () => {
  it('deletes locally when the event is still pending', () => {
    expect(classifyUndoAction('pending')).toBe('delete');
  });

  it('deletes locally when sync failed before reaching the server', () => {
    expect(classifyUndoAction('failed')).toBe('delete');
  });

  it('deletes locally when no outbox row exists', () => {
    expect(classifyUndoAction(undefined)).toBe('delete');
  });

  it('voids when the event was already sent', () => {
    expect(classifyUndoAction('sent')).toBe('void');
  });

  it('voids when the event is in flight so a later send is still undone', () => {
    expect(classifyUndoAction('sending')).toBe('void');
  });
});
