import { describe, expect, it } from 'vitest';
import {
  attendanceStatusLabel,
  isPresentStatus,
  matchesPlayerSearch,
  nextManualStatus,
} from '@/lib/attendance/status';
import { evaluateScan, scanFlashMessage } from '@/lib/attendance/evaluate-scan';
import { staleCardTokens } from '@/lib/attendance/tokens';

describe('attendanceStatusLabel', () => {
  it('maps all five statuses to Bahasa Indonesia', () => {
    expect(attendanceStatusLabel('present')).toBe('Hadir');
    expect(attendanceStatusLabel('late')).toBe('Terlambat');
    expect(attendanceStatusLabel('excused')).toBe('Izin');
    expect(attendanceStatusLabel('sick')).toBe('Sakit');
    expect(attendanceStatusLabel('absent')).toBe('Alfa');
    expect(attendanceStatusLabel(null)).toBe('Belum');
  });
});

describe('isPresentStatus', () => {
  it('treats hadir and terlambat as present', () => {
    expect(isPresentStatus('present')).toBe(true);
    expect(isPresentStatus('late')).toBe(true);
    expect(isPresentStatus('excused')).toBe(false);
    expect(isPresentStatus('sick')).toBe(false);
    expect(isPresentStatus('absent')).toBe(false);
  });
});

describe('nextManualStatus', () => {
  it('starts at hadir and cycles through izin, sakit, and alfa', () => {
    expect(nextManualStatus(null)).toBe('present');
    expect(nextManualStatus('present')).toBe('late');
    expect(nextManualStatus('late')).toBe('excused');
    expect(nextManualStatus('excused')).toBe('sick');
    expect(nextManualStatus('sick')).toBe('absent');
    expect(nextManualStatus('absent')).toBe('present');
  });
});

describe('matchesPlayerSearch', () => {
  const player = { nickname: 'Rizky', fullName: 'Rizky Pratama', jerseyNumber: 7 };

  it('matches nickname, full name, and jersey', () => {
    expect(matchesPlayerSearch(player, 'riz')).toBe(true);
    expect(matchesPlayerSearch(player, 'pratama')).toBe(true);
    expect(matchesPlayerSearch(player, '7')).toBe(true);
    expect(matchesPlayerSearch(player, 'andi')).toBe(false);
  });

  it('returns all players when query is empty', () => {
    expect(matchesPlayerSearch(player, '  ')).toBe(true);
  });
});

describe('evaluateScan', () => {
  it('rejects unknown tokens', () => {
    expect(evaluateScan({ card: undefined, player: undefined })).toEqual({ type: 'unknown_card' });
  });

  it('rejects tokens whose player is not on the roster', () => {
    expect(evaluateScan({ card: { playerId: 'p1' }, player: undefined })).toEqual({
      type: 'not_in_roster',
    });
  });

  it('does not add a row when the player is already present', () => {
    const decision = evaluateScan({
      card: { playerId: 'p1' },
      player: { id: 'p1', nickname: 'Rizky', status: 'present' },
    });
    expect(decision).toEqual({ type: 'duplicate', nickname: 'Rizky' });
    expect(scanFlashMessage(decision).message).toBe('Rizky sudah absen.');
  });

  it('marks a new scan as present', () => {
    expect(
      evaluateScan({
        card: { playerId: 'p1' },
        player: { id: 'p1', nickname: 'Rizky', status: null },
      }),
    ).toEqual({ type: 'mark_present', playerId: 'p1', nickname: 'Rizky' });
  });
});

describe('staleCardTokens', () => {
  it('drops revoked tokens for roster players', () => {
    expect(
      staleCardTokens(
        [
          { token: 'old', playerId: 'p1' },
          { token: 'keep', playerId: 'p1' },
          { token: 'other', playerId: 'p2' },
        ],
        [{ token: 'keep', playerId: 'p1' }],
        ['p1'],
      ),
    ).toEqual(['old']);
  });
});
