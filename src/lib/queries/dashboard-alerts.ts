import type { AttentionPlayer, WeeklyAttendance } from '@/lib/queries/dashboard';
import type { DashboardMessages } from '@/lib/i18n/messages/dashboard';

export type DashboardAlertMessages = DashboardMessages['alerts'];

export type DashboardAlert = {
  id: string;
  type: 'attendance_drop' | 'consecutive_absence' | 'low_attendance';
  severity: 'warning' | 'critical';
  playerId?: string;
  title: string;
  description: string;
  href?: string;
};

export function countConsecutiveAbsences(
  records: Array<{ status: string; sessionDate: string }>,
): number {
  const sorted = [...records].sort(
    (a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime(),
  );

  let streak = 0;
  for (const row of sorted) {
    if (row.status === 'absent') {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export function buildDashboardAlerts(
  attendance: WeeklyAttendance,
  attentionPlayers: AttentionPlayer[],
  m: DashboardAlertMessages,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (attendance.total >= 5 && attendance.trend <= -15) {
    alerts.push({
      id: 'attendance_drop_week',
      type: 'attendance_drop',
      severity: attendance.trend <= -25 ? 'critical' : 'warning',
      title: m.attendanceDropTitle,
      description: m.attendanceDropDesc.replace('{pct}', String(Math.abs(attendance.trend))).replace('{current}', String(attendance.pct)),
    });
  }

  for (const player of attentionPlayers) {
    if (player.reason.includes('berturut-turut')) {
      alerts.push({
        id: `consecutive:${player.id}`,
        type: 'consecutive_absence',
        severity: 'critical',
        playerId: player.id,
        title: m.consecutiveAbsenceTitle.replace('{name}', player.name),
        description: player.reason,
        href: `/players/${player.id}`,
      });
      continue;
    }

    if (player.reason.includes('Kehadiran rendah')) {
      alerts.push({
        id: `low_attendance:${player.id}`,
        type: 'low_attendance',
        severity: 'warning',
        playerId: player.id,
        title: m.lowAttendanceTitle.replace('{name}', player.name),
        description: player.reason,
        href: `/players/${player.id}`,
      });
    }
  }

  return alerts;
}

export const DISMISSED_ALERTS_KEY = 'ballin_dismissed_alerts';

export function readDismissedAlertIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_ALERTS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

export function dismissAlert(id: string): void {
  const next = readDismissedAlertIds();
  next.add(id);
  localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify([...next]));
}
