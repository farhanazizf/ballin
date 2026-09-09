'use client';

import { useTranslations } from './use-translations';

/**
 * @deprecated Use `useTranslations()` and access `t.shell` instead.
 * Kept for backward compatibility with existing coach layout imports.
 */
export function useCoachShell() {
  const { locale, setLocale, t } = useTranslations();
  return {
    locale,
    setLocale,
    t: t.shell,
  };
}
