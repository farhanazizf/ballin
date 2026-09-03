import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const playerLoginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  pin: z.string().length(6, 'PIN harus 6 digit').regex(/^\d+$/, 'PIN harus berisi angka'),
});

export type PlayerLoginInput = z.infer<typeof playerLoginSchema>;
