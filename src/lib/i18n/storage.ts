import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale, isLocale } from './types';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export function writeStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}
