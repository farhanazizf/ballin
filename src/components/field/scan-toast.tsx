'use client';

import { useEffect } from 'react';
import { CheckCircle, Info, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { ScanFeedback } from '@/lib/attendance/types';

interface ScanToastProps {
  feedback: ScanFeedback | null;
  onDismiss: () => void;
}

export function ScanToast({ feedback, onDismiss }: ScanToastProps) {
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(onDismiss, feedback.type === 'success' ? 1200 : 2200);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-4 top-16 z-40 mx-auto max-w-md',
        'rounded-[var(--radius-card)] border px-4 py-3 shadow-lg',
        'flex items-center gap-3 font-[family-name:var(--font-ui)] text-sm font-medium',
        feedback.type === 'success' &&
          'border-[var(--color-made)]/30 bg-[var(--color-made)]/15 text-[var(--color-made)]',
        feedback.type === 'notice' &&
          'border-[var(--color-gold)]/30 bg-[var(--color-gold)]/15 text-[var(--color-gold)]',
        feedback.type === 'error' &&
          'border-[var(--color-miss)]/30 bg-[var(--color-miss)]/15 text-[var(--color-miss)]',
      )}
      role="status"
      aria-live="polite"
    >
      {feedback.type === 'success' && <CheckCircle size={20} weight="fill" />}
      {feedback.type === 'notice' && <Info size={20} weight="fill" />}
      {feedback.type === 'error' && <WarningCircle size={20} weight="fill" />}
      <span>
        {feedback.type === 'success'
          ? `${feedback.nickname} hadir`
          : feedback.message}
      </span>
    </div>
  );
}
