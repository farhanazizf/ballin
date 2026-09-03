'use client';

import { memo, useCallback, useRef, useState } from 'react';
import { ArrowUUpLeft } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { recordRep, undoLastRep } from '@/lib/sync/record-rep';

export interface PlayerDrillCardProps {
  playerId: string;
  nickname: string;
  sessionDrillId: string;
  recordedBy: string;
  trackMisses: boolean;
  initialMade: number;
  initialAttempts: number;
  initialDnp: boolean;
}

const LONG_PRESS_MS = 500;

function vibrate() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export const PlayerDrillCard = memo(function PlayerDrillCard({
  playerId,
  nickname,
  sessionDrillId,
  recordedBy,
  trackMisses,
  initialMade,
  initialAttempts,
  initialDnp,
}: PlayerDrillCardProps) {
  const [made, setMade] = useState(initialMade);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [isDnp, setIsDnp] = useState(initialDnp);
  const [flash, setFlash] = useState<'made' | 'miss' | null>(null);
  const [pulse, setPulse] = useState(false);

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const triggerFlash = useCallback((type: 'made' | 'miss') => {
    setFlash(type);
    setPulse(true);
    vibrate();
    window.setTimeout(() => {
      setFlash(null);
      setPulse(false);
    }, 120);
  }, []);

  const handleMade = useCallback(() => {
    if (isDnp) return;

    setMade((m) => m + 1);
    setAttempts((a) => a + 1);
    triggerFlash('made');

    void recordRep({
      sessionDrillId,
      playerId,
      result: 'made',
      recordedBy,
    });
  }, [isDnp, playerId, recordedBy, sessionDrillId, triggerFlash]);

  const handleMiss = useCallback(() => {
    if (isDnp) return;

    setAttempts((a) => a + 1);
    triggerFlash('miss');

    void recordRep({
      sessionDrillId,
      playerId,
      result: 'miss',
      recordedBy,
    });
  }, [isDnp, playerId, recordedBy, sessionDrillId, triggerFlash]);

  const handleUndo = useCallback(async () => {
    const undone = await undoLastRep(sessionDrillId, playerId);
    if (!undone) return;

    vibrate();

    if (undone.result === 'made') {
      setMade((m) => Math.max(0, m - 1));
      setAttempts((a) => Math.max(0, a - 1));
    } else if (undone.result === 'miss') {
      setAttempts((a) => Math.max(0, a - 1));
    } else if (undone.result === 'dnp') {
      setIsDnp(false);
    }
  }, [playerId, sessionDrillId]);

  const toggleDnp = useCallback(async () => {
    if (isDnp) {
      await handleUndo();
      return;
    }

    setIsDnp(true);
    vibrate();

    void recordRep({
      sessionDrillId,
      playerId,
      result: 'dnp',
      recordedBy,
    });
  }, [handleUndo, isDnp, playerId, recordedBy, sessionDrillId]);

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  }, []);

  const onMadePointerDown = useCallback(() => {
    if (isDnp || trackMisses) return;
    longPressTriggered.current = false;
    clearLongPress();
    longPressRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      handleMiss();
    }, LONG_PRESS_MS);
  }, [clearLongPress, handleMiss, isDnp, trackMisses]);

  const onMadePointerUp = useCallback(() => {
    clearLongPress();
    if (!trackMisses && !longPressTriggered.current && !isDnp) {
      handleMade();
    }
  }, [clearLongPress, handleMade, isDnp, trackMisses]);

  return (
    <article
      className={cn(
        'relative flex min-h-[var(--size-touch-card)] flex-col overflow-hidden rounded-[var(--radius-card)] border',
        'bg-[var(--color-field-surface)] border-[var(--color-field-border)]',
        isDnp && 'opacity-60'
      )}
      aria-label={`${nickname}, ${made} dari ${attempts}${isDnp ? ', tidak ikut' : ''}`}
    >
      <div className="flex items-start justify-between gap-1 px-2 pt-2">
        <span className="truncate font-[family-name:var(--font-ui)] text-xl font-semibold leading-tight text-[var(--color-field-text)]">
          {nickname}
        </span>
        <button
          type="button"
          onClick={() => void toggleDnp()}
          aria-pressed={isDnp}
          className={cn(
            'shrink-0 rounded-[var(--radius-chip)] px-2 py-0.5',
            'font-[family-name:var(--font-ui)] text-xs font-semibold',
            'min-h-[var(--size-touch-min)] min-w-[var(--size-touch-min)]',
            isDnp
              ? 'bg-[var(--color-field-text-3)] text-[var(--color-field-bg)]'
              : 'bg-[var(--color-field-raised)] text-[var(--color-field-text-3)]'
          )}
        >
          {isDnp ? 'DNP' : '–'}
        </button>
      </div>

      <div
        className={cn(
          'flex flex-1 items-center justify-center px-2',
          pulse && 'scale-105 transition-transform duration-120'
        )}
      >
        <span
          className={cn(
            'font-[family-name:var(--font-display)] tabular-nums text-[28px] font-semibold leading-none',
            isDnp
              ? 'text-[var(--color-field-text-3)]'
              : 'text-[var(--color-field-text)]'
          )}
        >
          {isDnp ? '–' : `${made}/${attempts}`}
        </span>
      </div>

      {!isDnp && (
        <div className="flex min-h-[var(--size-touch-primary)] border-t border-[var(--color-field-border)]">
          {trackMisses ? (
            <>
              <button
                type="button"
                onClick={handleMade}
                aria-label={`${nickname} made`}
                className={cn(
                  'flex flex-[3] items-center justify-center',
                  'font-[family-name:var(--font-ui)] text-sm font-semibold',
                  'text-[var(--color-made)] active:bg-[var(--color-made)]/15',
                  flash === 'made' && 'bg-[var(--color-made)]/25'
                )}
              >
                ✓
              </button>
              <button
                type="button"
                onClick={handleMiss}
                aria-label={`${nickname} miss`}
                className={cn(
                  'flex flex-[2] items-center justify-center border-l border-[var(--color-field-border)]',
                  'font-[family-name:var(--font-ui)] text-sm font-semibold',
                  'text-[var(--color-miss)] active:bg-[var(--color-miss)]/15',
                  flash === 'miss' && 'bg-[var(--color-miss)]/25'
                )}
              >
                ✗
              </button>
            </>
          ) : (
            <button
              type="button"
              onPointerDown={onMadePointerDown}
              onPointerUp={onMadePointerUp}
              onPointerLeave={clearLongPress}
              onPointerCancel={clearLongPress}
              aria-label={`${nickname} tap made, tahan untuk miss`}
              className={cn(
                'flex flex-1 items-center justify-center',
                'font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-field-text-2)]',
                'active:bg-[var(--color-field-raised)]',
                flash === 'made' && 'bg-[var(--color-made)]/25 text-[var(--color-made)]',
                flash === 'miss' && 'bg-[var(--color-miss)]/25 text-[var(--color-miss)]'
              )}
            >
              Ketuk +1
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => void handleUndo()}
        aria-label={`Urungkan rep terakhir ${nickname}`}
        className={cn(
          'absolute bottom-[calc(var(--size-touch-primary)+4px)] right-1',
          'flex h-[var(--size-touch-min)] w-[var(--size-touch-min)] items-center justify-center',
          'rounded-[var(--radius-panel)] bg-[var(--color-field-raised)]/90',
          'text-[var(--color-field-text-2)] active:bg-[var(--color-field-border)]',
          isDnp && 'bottom-2'
        )}
      >
        <ArrowUUpLeft size={18} weight="bold" aria-hidden />
      </button>
    </article>
  );
});
