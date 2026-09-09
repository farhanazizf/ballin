'use client';

import { getMessages } from './messages';
import { useLocale } from './locale-provider';

export function useTranslations() {
  const { locale, setLocale } = useLocale();
  return { locale, setLocale, t: getMessages(locale) };
}
