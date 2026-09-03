import { describe, expect, it } from 'vitest';
import {
  formatDateGroupLabel,
  getDateKeyWib,
  groupSessionsByDate,
  sessionStatusLabel,
  type SessionListItem,
} from '@/lib/queries/sessions';

const sampleSessions: SessionListItem[] = [
  {
    id: '40000000-0000-0000-0000-000000000002',
    scheduledStart: '2026-09-03T09:00:00.000Z',
    scheduledEnd: '2026-09-03T11:00:00.000Z',
    location: 'GOR Dynasty',
    status: 'active',
    sessionType: 'training',
    teamName: 'Boys',
    teamId: '20000000-0000-0000-0000-000000000001',
    attendanceCount: 2,
    rosterCount: 12,
  },
  {
    id: '40000000-0000-0000-0000-000000000001',
    scheduledStart: '2026-08-28T09:00:00.000Z',
    scheduledEnd: null,
    location: null,
    status: 'completed',
    sessionType: 'training',
    teamName: 'Boys',
    teamId: '20000000-0000-0000-0000-000000000001',
    attendanceCount: 10,
    rosterCount: 12,
  },
];

describe('getDateKeyWib', () => {
  it('returns YYYY-MM-DD in WIB', () => {
    expect(getDateKeyWib('2026-09-03T09:00:00.000Z')).toBe('2026-09-03');
  });
});

describe('formatDateGroupLabel', () => {
  it('formats date in Indonesian', () => {
    const label = formatDateGroupLabel('2026-09-03');
    expect(label).toContain('2026');
    expect(label.toLowerCase()).toMatch(/rabu|selasa|kamis/);
  });
});

describe('sessionStatusLabel', () => {
  it('returns Indonesian labels', () => {
    expect(sessionStatusLabel('active')).toBe('Sedang berlangsung');
    expect(sessionStatusLabel('scheduled')).toBe('Belum dimulai');
  });
});

describe('groupSessionsByDate', () => {
  it('groups sessions by WIB date descending', () => {
    const groups = groupSessionsByDate(sampleSessions);
    expect(groups).toHaveLength(2);
    expect(groups[0].dateKey).toBe('2026-09-03');
    expect(groups[0].sessions[0].id).toBe(sampleSessions[0].id);
    expect(groups[1].dateKey).toBe('2026-08-28');
  });
});
