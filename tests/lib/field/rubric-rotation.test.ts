import { describe, expect, it } from 'vitest';
import { pickRubricPlayers } from '@/lib/field/rubric-rotation';

describe('pickRubricPlayers', () => {
  it('memilih pemain yang paling lama belum dinilai', () => {
    const roster = [
      { id: 'a', nickname: 'A', lastScoredAt: '2026-09-01T00:00:00Z' },
      { id: 'b', nickname: 'B', lastScoredAt: null },
      { id: 'c', nickname: 'C', lastScoredAt: '2026-08-01T00:00:00Z' },
    ];

    const picked = pickRubricPlayers(roster, new Set(), 2);
    expect(picked.map((p) => p.id)).toEqual(['b', 'c']);
  });

  it('melewati pemain yang sudah dinilai di sesi ini', () => {
    const roster = [
      { id: 'a', nickname: 'A', lastScoredAt: null },
      { id: 'b', nickname: 'B', lastScoredAt: null },
    ];
    const picked = pickRubricPlayers(roster, new Set(['a']), 5);
    expect(picked.map((p) => p.id)).toEqual(['b']);
  });
});
