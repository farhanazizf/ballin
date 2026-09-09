'use client';

import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/i18n/locale-provider';
import type { Locale } from '@/lib/i18n/types';

const OPTIONS: Locale[] = ['id', 'en'];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className={cn(
        'inline-flex border border-[var(--color-field-border)]',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map((option) => {
        const selected = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={selected}
            className={cn(
              'px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors',
              selected
                ? 'bg-[var(--color-hazard)] text-[var(--color-phosphor)]'
                : 'text-[var(--color-field-text-3)] hover:text-[var(--color-phosphor)]',
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
