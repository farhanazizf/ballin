import { isPresentStatus } from '@/lib/attendance/status';
import type { AttendanceStatus } from '@/lib/attendance/types';

export type ScanDecision =
  | { type: 'unknown_card' }
  | { type: 'not_in_roster' }
  | { type: 'duplicate'; nickname: string }
  | { type: 'mark_present'; playerId: string; nickname: string };

export function evaluateScan(input: {
  card: { playerId: string } | undefined;
  player: { id: string; nickname: string; status: AttendanceStatus | null } | undefined;
}): ScanDecision {
  if (!input.card) return { type: 'unknown_card' };
  if (!input.player) return { type: 'not_in_roster' };
  if (isPresentStatus(input.player.status)) {
    return { type: 'duplicate', nickname: input.player.nickname };
  }
  return {
    type: 'mark_present',
    playerId: input.player.id,
    nickname: input.player.nickname,
  };
}

export function scanFlashMessage(decision: ScanDecision): { type: 'success' | 'error' | 'info'; message: string } {
  switch (decision.type) {
    case 'unknown_card':
      return {
        type: 'error',
        message: 'Kartu tidak dikenali. Periksa kartu atau tandai manual.',
      };
    case 'not_in_roster':
      return { type: 'error', message: 'Pemain tidak terdaftar di kelas sesi ini.' };
    case 'duplicate':
      return { type: 'info', message: `${decision.nickname} sudah absen.` };
    case 'mark_present':
      return { type: 'success', message: `${decision.nickname} hadir` };
  }
}
