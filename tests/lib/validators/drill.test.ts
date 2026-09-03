import { describe, expect, it } from 'vitest';
import { drillEventSchema, drillSchema } from '@/lib/validators/drill';

describe('drillSchema', () => {
  it('accepts attempt drill with attribute weights', () => {
    const result = drillSchema.safeParse({
      name: 'Free throw',
      category: 'Shooting',
      type: 'attempt',
      defaultTarget: 10,
      unit: 'percobaan',
      lowerIsBetter: false,
      attributeWeights: { shooting: 0.8, attitude: 0.2 },
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty drill name', () => {
    const result = drillSchema.safeParse({
      name: '',
      category: 'Shooting',
      type: 'attempt',
    });
    expect(result.success).toBe(false);
  });
});

describe('drillEventSchema', () => {
  it('accepts made/miss/dnp results', () => {
    for (const result of ['made', 'miss', 'dnp'] as const) {
      expect(
        drillEventSchema.safeParse({
          sessionDrillId: '50000000-0000-4000-8000-000000000001',
          playerId: '30000000-0000-4000-8000-000000000001',
          result,
        }).success
      ).toBe(true);
    }
  });
});
