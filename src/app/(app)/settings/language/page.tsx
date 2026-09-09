'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n/use-translations';
import type { Locale } from '@/lib/i18n/types';

export default function LanguageSettingsPage() {
  const { locale, setLocale, t: messages } = useTranslations();
  const t = messages.shell;

  const options: Array<{ value: Locale; label: string }> = [
    { value: 'id', label: t.language.id },
    { value: 'en', label: t.language.en },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="brut-heading text-2xl text-[var(--color-report-text)]">{t.language.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-report-text-2)]">{t.language.description}</p>

      <div className="mt-6 border-2 border-[var(--color-report-border)]">
        {options.map((option) => {
          const selected = locale === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setLocale(option.value)}
              className={cn(
                'flex w-full items-center justify-between border-b-2 border-[var(--color-report-border)] px-4 py-4 last:border-b-0',
                'font-mono text-[11px] uppercase tracking-[0.1em] transition-colors',
                selected
                  ? 'bg-[var(--color-report-text)] text-[var(--color-phosphor)]'
                  : 'text-[var(--color-report-text-2)] hover:bg-[var(--color-report-border)]/10 hover:text-[var(--color-report-text)]',
              )}
            >
              <span>{option.label}</span>
              <span className={selected ? 'text-[var(--color-hazard)]' : 'text-[var(--color-report-text-3)]'}>
                {selected ? '●' : '○'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
