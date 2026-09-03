import { describe, expect, it } from 'vitest';
import { playerSchema, playerMeasurementSchema } from '@/lib/validators/player';

describe('playerSchema', () => {
  const valid = {
    fullName: 'Rizky Ramadhan',
    nickname: 'Rizky',
    birthDate: '2012-03-15',
    jerseyNumber: 7,
    teamIds: ['30000000-0000-4000-8000-000000000001'],
  };

  it('accepts valid player input', () => {
    expect(playerSchema.safeParse(valid).success).toBe(true);
  });

  it('requires at least one team', () => {
    const result = playerSchema.safeParse({ ...valid, teamIds: [] });
    expect(result.success).toBe(false);
  });

  it('rejects invalid birth date format', () => {
    const result = playerSchema.safeParse({ ...valid, birthDate: '15-03-2012' });
    expect(result.success).toBe(false);
  });
});

describe('playerMeasurementSchema', () => {
  it('accepts partial measurements', () => {
    const result = playerMeasurementSchema.safeParse({
      playerId: '30000000-0000-4000-8000-000000000001',
      measuredOn: '2026-08-01',
      heightCm: 168.5,
    });
    expect(result.success).toBe(true);
  });
});
