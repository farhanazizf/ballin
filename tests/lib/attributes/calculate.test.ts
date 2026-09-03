import { describe, expect, it } from 'vitest';
import {
  determineArchetype,
  type AttributeValues,
} from '@/lib/attributes/calculate';

describe('determineArchetype', () => {
  it('returns Slasher when finishing is highest', () => {
    const attrs: AttributeValues = {
      shooting: 55,
      finishing: 78,
      ballhandling: 62,
      defense: 45,
      athleticism: 71,
      attitude: 80,
    };
    expect(determineArchetype(attrs)).toBe('Slasher');
  });

  it('returns Shooter when shooting dominates', () => {
    const attrs: AttributeValues = {
      shooting: 72,
      finishing: 58,
      ballhandling: 55,
      defense: 50,
      athleticism: 60,
      attitude: 75,
    };
    expect(determineArchetype(attrs)).toBe('Shooter');
  });

  it('returns Glue Guy for even spread with high attitude', () => {
    const attrs: AttributeValues = {
      shooting: 62,
      finishing: 64,
      ballhandling: 63,
      defense: 61,
      athleticism: 62,
      attitude: 70,
    };
    expect(determineArchetype(attrs)).toBe('Glue Guy');
  });
});
