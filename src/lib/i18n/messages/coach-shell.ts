import type { Locale } from '../types';
import { shell, type ShellMessages } from './shell';

/**
 * @deprecated Import from `./shell` or use `getMessages(locale).shell` instead.
 */
export type CoachShellMessages = ShellMessages;

/** @deprecated Use `getMessages(locale).shell` instead. */
export function getCoachShellMessages(locale: Locale): CoachShellMessages {
  return shell[locale];
}
