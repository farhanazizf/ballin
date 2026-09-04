import { describe, expect, it } from 'vitest';
import {
  defaultStationLabels,
  rotateStationAssignments,
  splitPlayersEvenly,
} from '@/lib/field/stations';

describe('splitPlayersEvenly', () => {
  it('membagi pemain merata', () => {
    const players = ['a', 'b', 'c', 'd', 'e'];
    expect(splitPlayersEvenly(players, 2)).toEqual([['a', 'c', 'e'], ['b', 'd']]);
  });
});

describe('rotateStationAssignments', () => {
  it('menggeser kelompok satu pos', () => {
    const input = [
      { label: 'Pos 1', playerIds: ['a', 'b'] },
      { label: 'Pos 2', playerIds: ['c'] },
    ];
    expect(rotateStationAssignments(input)).toEqual([
      { label: 'Pos 1', playerIds: ['c'] },
      { label: 'Pos 2', playerIds: ['a', 'b'] },
    ]);
  });
});

describe('defaultStationLabels', () => {
  it('menghasilkan label Pos N', () => {
    expect(defaultStationLabels(3)).toEqual(['Pos 1', 'Pos 2', 'Pos 3']);
  });
});
