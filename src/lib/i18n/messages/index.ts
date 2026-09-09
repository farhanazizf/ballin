import type { Locale } from '../types';
import { common } from './common';
import { shell } from './shell';
import { auth } from './auth';
import { validation } from './validation';
import { dashboard } from './dashboard';
import { players } from './players';
import { sessions } from './sessions';
import { matches } from './matches';
import { reports } from './reports';
import { settings } from './settings';
import { field } from './field';
import { player } from './player';

const namespaces = {
  common,
  shell,
  auth,
  validation,
  dashboard,
  players,
  sessions,
  matches,
  reports,
  settings,
  field,
  player,
} as const;

export type Messages = {
  [K in keyof typeof namespaces]: (typeof namespaces)[K][Locale];
};

export function getMessages(locale: Locale): Messages {
  return {
    common: common[locale],
    shell: shell[locale],
    auth: auth[locale],
    validation: validation[locale],
    dashboard: dashboard[locale],
    players: players[locale],
    sessions: sessions[locale],
    matches: matches[locale],
    reports: reports[locale],
    settings: settings[locale],
    field: field[locale],
    player: player[locale],
  };
}

export type { ValidationMessages, ValidationLocale } from './validation';
export type { PlayerMessages } from './player';

export {
  common,
  shell,
  auth,
  validation,
  dashboard,
  players,
  sessions,
  matches,
  reports,
  settings,
  field,
  player,
};
