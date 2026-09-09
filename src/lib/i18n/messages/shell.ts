import type { Locale } from '../types';

/** Coach app shell navigation and layout strings (formerly coach-shell). */
export const shell = {
  id: {
    brand: '[ Ballin / Coach ]',
    sidebarTitle: 'Ops',
    nav: {
      home: 'Beranda',
      players: 'Pemain',
      sessions: 'Latihan',
      matches: 'Match',
      reports: 'Rapor',
    },
    settings: 'Pengaturan',
    signOut: 'Keluar',
    signOutPending: 'Keluar…',
    language: {
      title: 'Bahasa',
      description: 'Pilih bahasa antarmuka coach.',
      id: 'Indonesia',
      en: 'English',
    },
    settingsNav: {
      teams: 'Kelas',
      drills: 'Drill library',
      language: 'Bahasa',
    },
  },
  en: {
    brand: '[ Ballin / Coach ]',
    sidebarTitle: 'Ops',
    nav: {
      home: 'Home',
      players: 'Players',
      sessions: 'Sessions',
      matches: 'Matches',
      reports: 'Reports',
    },
    settings: 'Settings',
    signOut: 'Sign out',
    signOutPending: 'Signing out…',
    language: {
      title: 'Language',
      description: 'Choose the coach interface language.',
      id: 'Indonesian',
      en: 'English',
    },
    settingsNav: {
      teams: 'Teams',
      drills: 'Drill library',
      language: 'Language',
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type ShellMessages = (typeof shell)[Locale];
