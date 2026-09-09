import type { Locale } from '../types';

export const validation = {
  id: {
    auth: {
      emailInvalid: 'Email tidak valid',
      passwordMin: 'Password minimal 8 karakter',
      usernameRequired: 'Username wajib diisi',
      usernameMin: 'Username minimal 3 karakter',
      usernameMax: 'Username maksimal 32 karakter',
      usernameFormat: 'Username hanya huruf, angka, titik, strip, underscore',
      pinLength: 'PIN harus 6 digit',
      pinDigits: 'PIN harus berisi angka',
    },
    player: {
      fullNameRequired: 'Nama lengkap wajib diisi',
      nicknameRequired: 'Nama panggilan wajib diisi',
      birthDateInvalid: 'Tanggal lahir tidak valid',
      teamRequired: 'Pilih minimal satu kelas',
      invalidData: 'Data pemain tidak valid.',
    },
    session: {
      teamRequired: 'Kelas wajib dipilih',
      daysRequired: 'Pilih minimal satu hari latihan',
      timeFormat: 'Format waktu HH:mm',
      cancelReasonRequired: 'Alasan pembatalan wajib diisi',
      startRequired: 'Waktu mulai wajib diisi',
      invalidData: 'Data sesi tidak valid. Periksa kelas dan waktu mulai.',
    },
    match: {
      opponentRequired: 'Nama lawan wajib diisi',
    },
    drill: {
      nameRequired: 'Nama drill wajib diisi',
      invalidData: 'Data drill tidak valid.',
    },
    team: {
      nameRequired: 'Nama kelas wajib diisi',
      ageRangeInvalid: 'Usia minimum tidak boleh lebih besar dari usia maksimum',
      invalidData: 'Data kelas tidak valid.',
    },
    station: {
      labelRequired: 'Nama pos wajib diisi.',
    },
    note: {
      noteRequired: 'Catatan wajib diisi',
    },
    sync: {
      madeExceedsAttempts: 'Made tidak boleh lebih besar dari attempts',
    },
    id: {
      invalid: 'ID tidak valid',
    },
  },
  en: {
    auth: {
      emailInvalid: 'Invalid email',
      passwordMin: 'Password must be at least 8 characters',
      usernameRequired: 'Username is required',
      usernameMin: 'Username must be at least 3 characters',
      usernameMax: 'Username must be at most 32 characters',
      usernameFormat: 'Username may only contain letters, numbers, dots, hyphens, and underscores',
      pinLength: 'PIN must be 6 digits',
      pinDigits: 'PIN must contain only digits',
    },
    player: {
      fullNameRequired: 'Full name is required',
      nicknameRequired: 'Nickname is required',
      birthDateInvalid: 'Invalid birth date',
      teamRequired: 'Select at least one team',
      invalidData: 'Invalid player data.',
    },
    session: {
      teamRequired: 'Team is required',
      daysRequired: 'Select at least one practice day',
      timeFormat: 'Time format must be HH:mm',
      cancelReasonRequired: 'Cancellation reason is required',
      startRequired: 'Start time is required',
      invalidData: 'Invalid session data. Check team and start time.',
    },
    match: {
      opponentRequired: 'Opponent name is required',
    },
    drill: {
      nameRequired: 'Drill name is required',
      invalidData: 'Invalid drill data.',
    },
    team: {
      nameRequired: 'Team name is required',
      ageRangeInvalid: 'Minimum age cannot be greater than maximum age',
      invalidData: 'Invalid team data.',
    },
    station: {
      labelRequired: 'Station name is required.',
    },
    note: {
      noteRequired: 'Note is required',
    },
    sync: {
      madeExceedsAttempts: 'Made cannot exceed attempts',
    },
    id: {
      invalid: 'Invalid ID',
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type ValidationLocale = (typeof validation)[Locale];
export type ValidationMessages = ValidationLocale['auth'];
