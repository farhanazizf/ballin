import type { AttendanceStatus } from '@/lib/attendance/types';

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'present',
  'late',
  'excused',
  'sick',
  'absent',
];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  excused: 'Izin',
  sick: 'Sakit',
  absent: 'Alfa',
};

export function attendanceStatusLabel(status: AttendanceStatus | string | null | undefined): string {
  if (!status) return 'Belum';
  return STATUS_LABELS[status as AttendanceStatus] ?? status;
}

export function isPresentStatus(status: string | null | undefined): boolean {
  return status === 'present' || status === 'late';
}

/** Cycle Hadir → Terlambat → Izin → Sakit → Alfa → Hadir. First tap from empty is Hadir. */
export function nextManualStatus(current: AttendanceStatus | null): AttendanceStatus {
  if (!current) return 'present';
  const index = ATTENDANCE_STATUSES.indexOf(current);
  if (index === -1) return 'present';
  return ATTENDANCE_STATUSES[(index + 1) % ATTENDANCE_STATUSES.length]!;
}

export function matchesPlayerSearch(
  player: { nickname: string; fullName: string; jerseyNumber?: number | null },
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const jersey = player.jerseyNumber != null ? String(player.jerseyNumber) : '';
  return (
    player.nickname.toLowerCase().includes(needle) ||
    player.fullName.toLowerCase().includes(needle) ||
    jersey.includes(needle)
  );
}
