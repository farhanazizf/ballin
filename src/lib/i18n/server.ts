import { cookies } from 'next/headers';
import { getMessages } from './messages';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, isLocale } from './types';

export async function getServerLocale() {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_STORAGE_KEY)?.value;
  return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

export async function getServerMessages() {
  return getMessages(await getServerLocale());
}
