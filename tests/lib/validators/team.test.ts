import { describe, expect, it } from 'vitest';
import { teamSchema } from '@/lib/validators/team';

describe('teamSchema', () => {
  it('accepts valid team with age range', () => {
    const result = teamSchema.safeParse({
      name: 'Hoops',
      ageMin: 7,
      ageMax: 11,
      trackDrillStats: true,
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts team without age range', () => {
    const result = teamSchema.safeParse({
      name: 'Kompetisi',
      trackDrillStats: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = teamSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects ageMin greater than ageMax', () => {
    const result = teamSchema.safeParse({
      name: 'Invalid',
      ageMin: 12,
      ageMax: 8,
    });
    expect(result.success).toBe(false);
  });
});
