import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const playerLoginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username wajib diisi')
    .transform((value) => value.trim().toLowerCase()),
  pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN harus berisi angka'),
});

export type PlayerLoginInput = z.infer<typeof playerLoginSchema>;


export const playerCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(32, 'Username maksimal 32 karakter')
    .regex(/^[a-z0-9._-]+$/i, 'Username hanya huruf, angka, titik, strip, underscore')
    .transform((value) => value.trim().toLowerCase()),
  pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN harus berisi angka'),
});

export type PlayerCredentialsInput = z.infer<typeof playerCredentialsSchema>;
