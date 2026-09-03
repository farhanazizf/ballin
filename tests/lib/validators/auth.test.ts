import { describe, expect, it } from 'vitest';
import { loginSchema, playerLoginSchema } from '@/lib/validators/auth';

describe('loginSchema', () => {
  it('accepts valid coach credentials', () => {
    const result = loginSchema.safeParse({
      email: 'coach@dynasty.test',
      password: 'Coach123!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'bukan-email',
      password: 'Coach123!',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'coach@dynasty.test',
      password: '1234567',
    });
    expect(result.success).toBe(false);
  });
});

describe('playerLoginSchema', () => {
  it('accepts valid username and 6-digit PIN', () => {
    const result = playerLoginSchema.safeParse({
      username: 'rizky',
      pin: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric PIN', () => {
    const result = playerLoginSchema.safeParse({
      username: 'rizky',
      pin: '12ab56',
    });
    expect(result.success).toBe(false);
  });

  it('rejects PIN with wrong length', () => {
    const result = playerLoginSchema.safeParse({
      username: 'rizky',
      pin: '12345',
    });
    expect(result.success).toBe(false);
  });
});
