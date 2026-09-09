import { z } from 'zod/v4';
import type { ValidationMessages } from '@/lib/i18n/messages';

export function createLoginSchema(v: ValidationMessages) {
  return z.object({
    email: z.email(v.emailInvalid),
    password: z.string().min(8, v.passwordMin),
  });
}

export const loginSchema = createLoginSchema({
  emailInvalid: 'Email tidak valid',
  passwordMin: 'Password minimal 8 karakter',
  usernameRequired: 'Username wajib diisi',
  pinLength: 'PIN harus 6 digit',
  pinDigits: 'PIN harus berisi angka',
  usernameMin: 'Username minimal 3 karakter',
  usernameMax: 'Username maksimal 32 karakter',
  usernameFormat: 'Username hanya huruf, angka, titik, strip, underscore',
});

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;

export function createPlayerLoginSchema(v: ValidationMessages) {
  return z.object({
    username: z
      .string()
      .min(1, v.usernameRequired)
      .transform((value) => value.trim().toLowerCase()),
    pin: z.string().length(6, v.pinLength).regex(/^\d+$/, v.pinDigits),
  });
}

export const playerLoginSchema = createPlayerLoginSchema({
  emailInvalid: 'Email tidak valid',
  passwordMin: 'Password minimal 8 karakter',
  usernameRequired: 'Username wajib diisi',
  pinLength: 'PIN harus 6 digit',
  pinDigits: 'PIN harus berisi angka',
  usernameMin: 'Username minimal 3 karakter',
  usernameMax: 'Username maksimal 32 karakter',
  usernameFormat: 'Username hanya huruf, angka, titik, strip, underscore',
});

export type PlayerLoginInput = z.infer<ReturnType<typeof createPlayerLoginSchema>>;

export function createPlayerCredentialsSchema(v: ValidationMessages) {
  return z.object({
    username: z
      .string()
      .min(3, v.usernameMin)
      .max(32, v.usernameMax)
      .regex(/^[a-z0-9._-]+$/i, v.usernameFormat)
      .transform((value) => value.trim().toLowerCase()),
    pin: z.string().length(6, v.pinLength).regex(/^\d+$/, v.pinDigits),
  });
}

export const playerCredentialsSchema = createPlayerCredentialsSchema({
  emailInvalid: 'Email tidak valid',
  passwordMin: 'Password minimal 8 karakter',
  usernameRequired: 'Username wajib diisi',
  pinLength: 'PIN harus 6 digit',
  pinDigits: 'PIN harus berisi angka',
  usernameMin: 'Username minimal 3 karakter',
  usernameMax: 'Username maksimal 32 karakter',
  usernameFormat: 'Username hanya huruf, angka, titik, strip, underscore',
});

export type PlayerCredentialsInput = z.infer<ReturnType<typeof createPlayerCredentialsSchema>>;
