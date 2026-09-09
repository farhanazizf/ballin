import type { Locale } from '../types';

export const matches = {
  id: {
    title: 'Pertandingan',
    subtitle: 'Jadwalkan match dan catat box score',
    newMatch: 'Match baru',
    opponentPlaceholder: 'Nama lawan',
    locationOptional: 'Lokasi (opsional)',
    fillRequired: 'Isi kelas, lawan, dan tanggal pertandingan.',
    saveFailed: 'Gagal menyimpan pertandingan.',
    emptyTitle: 'Belum ada pertandingan',
    emptyDesc: 'Buat match baru untuk mulai mencatat box score.',
    backToList: 'Daftar pertandingan',
    boxScore: 'Box score',
    boxScoreSaved: 'Box score tersimpan.',
    boxScoreSaveFailed: 'Gagal menyimpan box score.',
    playerColumn: 'Pemain',
    vs: 'vs',
    saveBoxScore: 'Simpan box score',
  },
  en: {
    title: 'Matches',
    subtitle: 'Schedule matches and record box scores',
    newMatch: 'New match',
    opponentPlaceholder: 'Opponent name',
    locationOptional: 'Location (optional)',
    fillRequired: 'Fill in team, opponent, and match date.',
    saveFailed: 'Failed to save match.',
    emptyTitle: 'No matches yet',
    emptyDesc: 'Create a new match to start recording box scores.',
    backToList: 'Match list',
    boxScore: 'Box score',
    boxScoreSaved: 'Box score saved.',
    boxScoreSaveFailed: 'Failed to save box score.',
    playerColumn: 'Player',
    vs: 'vs',
    saveBoxScore: 'Save box score',
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type MatchesMessages = (typeof matches)[Locale];
