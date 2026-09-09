import type { Locale } from '../types';

export const player = {
  id: {
    layout: {
      brand: '[ Kartu / Pemain ]',
      refresh: 'Perbarui',
      signOut: 'Keluar',
      signOutPending: 'Keluar…',
    },
    card: {
      ageYears: '{age} tahun',
      waitingFirstSession: {
        title: 'Kartumu menunggu latihan pertama',
        description: 'Datang latihan dan ikut drill untuk melihat perkembangan, bentuk permainan, dan lencana di sini.',
      },
      profileNotLinked: {
        title: 'Profil pemain belum terhubung',
        description: 'Hubungi coach atau admin akademi untuk menghubungkan akun login dengan data pemainmu.',
      },
      notFound: {
        title: 'Data pemain tidak ditemukan',
        description: 'Coba keluar lalu masuk lagi. Jika masalah berlanjut, hubungi coach.',
      },
      streakLabel: 'latihan beruntun',
      attended: 'Hadir',
      absent: 'Tidak hadir',
      gameShape: 'Bentuk permainan',
      now: 'Sekarang',
      before: 'Sebelumnya',
      recentStats: 'Statistik terbaru',
      personalBests: 'Rekor pribadi',
      badges: 'Lencana',
      trend: {
        up: 'Naik',
        down: 'Turun',
        same: 'Sama',
      },
    },
  },
  en: {
    layout: {
      brand: '[ Card / Player ]',
      refresh: 'Refresh',
      signOut: 'Sign out',
      signOutPending: 'Signing out…',
    },
    card: {
      ageYears: '{age} years old',
      waitingFirstSession: {
        title: 'Your card awaits the first practice',
        description: 'Come to practice and join drills to see progress, game shape, and badges here.',
      },
      profileNotLinked: {
        title: 'Player profile not linked',
        description: 'Contact your coach or academy admin to link your login with your player data.',
      },
      notFound: {
        title: 'Player data not found',
        description: 'Try signing out and back in. If the problem continues, contact your coach.',
      },
      streakLabel: 'session streak',
      attended: 'Present',
      absent: 'Absent',
      gameShape: 'Game shape',
      now: 'Now',
      before: 'Previous',
      recentStats: 'Recent stats',
      personalBests: 'Personal bests',
      badges: 'Badges',
      trend: {
        up: 'Up',
        down: 'Down',
        same: 'Same',
      },
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type PlayerMessages = (typeof player)[Locale];
