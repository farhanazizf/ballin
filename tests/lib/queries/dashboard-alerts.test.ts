import { describe, expect, it } from 'vitest';
import {
  buildDashboardAlerts,
  countConsecutiveAbsences,
} from '@/lib/queries/dashboard-alerts';
import type { AttentionPlayer, WeeklyAttendance } from '@/lib/queries/dashboard';

describe('countConsecutiveAbsences', () => {
  it('menghitung absen berturut dari sesi terbaru', () => {
    const streak = countConsecutiveAbsences([
      { status: 'absent', sessionDate: '2026-09-07' },
      { status: 'absent', sessionDate: '2026-09-05' },
      { status: 'absent', sessionDate: '2026-09-03' },
      { status: 'present', sessionDate: '2026-09-01' },
    ]);
    expect(streak).toBe(3);
  });

  it('menghentikan streak saat hadir', () => {
    const streak = countConsecutiveAbsences([
      { status: 'absent', sessionDate: '2026-09-07' },
      { status: 'absent', sessionDate: '2026-09-05' },
      { status: 'present', sessionDate: '2026-09-03' },
      { status: 'absent', sessionDate: '2026-09-01' },
    ]);
    expect(streak).toBe(2);
  });
});

describe('buildDashboardAlerts', () => {
  const baseAttendance: WeeklyAttendance = {
    present: 20,
    total: 30,
    pct: 67,
    trend: -20,
    weekly: [],
  };

  it('membuat alert penurunan kehadiran tim', () => {
    const alerts = buildDashboardAlerts(baseAttendance, []);
    expect(alerts.some((a) => a.type === 'attendance_drop')).toBe(true);
  });

  it('membuat alert absen beruntun per pemain', () => {
    const players: AttentionPlayer[] = [
      {
        id: 'p1',
        name: 'Rizky',
        reason: 'Tidak hadir 3 sesi berturut-turut',
      },
    ];
    const alerts = buildDashboardAlerts({ ...baseAttendance, trend: 0, total: 0 }, players);
    expect(alerts[0]?.type).toBe('consecutive_absence');
    expect(alerts[0]?.href).toBe('/players/p1');
  });
});
