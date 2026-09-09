import type { Locale } from '../types';

export const auth = {
  id: {
    coach: {
      badge: '[ AUTH / COACH ]',
      title: 'BALLIN.',
      terminalLabel: '>>> credentials / coach terminal',
      emailLabel: 'Email',
      emailPlaceholder: 'coach@akademi.id',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Minimal 8 karakter',
      submit: '>>> Masuk ke dashboard',
      switchToPlayer: 'Masuk sebagai pemain',
      invalidCredentials: 'Email atau password salah. Periksa kembali dan coba lagi.',
      loginFailed: 'Gagal masuk. Periksa koneksi internet dan coba lagi.',
    },
    player: {
      badge: '[ AUTH / PLAYER ]',
      title: 'BALLIN.',
      terminalLabel: '>>> credentials / terminal',
      usernameLabel: 'Username',
      usernamePlaceholder: 'rizky',
      pinLabel: 'Pin 6 digit',
      pinAriaLabel: 'Masukkan PIN 6 digit',
      pinDigitAria: 'Digit {current} dari {total}',
      submit: '>>> Masuk ke kartu',
      switchToCoach: 'Masuk sebagai coach',
      retryIn: 'Retry in',
    },
  },
  en: {
    coach: {
      badge: '[ AUTH / COACH ]',
      title: 'BALLIN.',
      terminalLabel: '>>> credentials / coach terminal',
      emailLabel: 'Email',
      emailPlaceholder: 'coach@akademi.id',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 8 characters',
      submit: '>>> Go to dashboard',
      switchToPlayer: 'Sign in as player',
      invalidCredentials: 'Incorrect email or password. Check and try again.',
      loginFailed: 'Sign-in failed. Check your connection and try again.',
    },
    player: {
      badge: '[ AUTH / PLAYER ]',
      title: 'BALLIN.',
      terminalLabel: '>>> credentials / terminal',
      usernameLabel: 'Username',
      usernamePlaceholder: 'rizky',
      pinLabel: '6-digit PIN',
      pinAriaLabel: 'Enter 6-digit PIN',
      pinDigitAria: 'Digit {current} of {total}',
      submit: '>>> Go to card',
      switchToCoach: 'Sign in as coach',
      retryIn: 'Retry in',
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type AuthMessages = (typeof auth)[Locale];
