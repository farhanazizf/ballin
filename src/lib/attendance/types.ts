import type { AttendanceInput } from '@/lib/validators/session';

export type AttendanceStatus = AttendanceInput['status'];
export type AttendanceMethod = AttendanceInput['method'];

export type AttendanceSetupSession = {
  id: string;
  teamId: string;
  teamName: string;
  scheduledStart: string;
  scheduledEnd?: string;
  location?: string;
  status: string;
  sessionType: string;
  sessionDate: string;
};

export type AttendanceSetupPlayer = {
  id: string;
  nickname: string;
  fullName: string;
  jerseyNumber: number | null;
  hasCard: boolean;
  status: AttendanceStatus | null;
  method: AttendanceMethod | null;
};

export type AttendanceSetupData = {
  session: AttendanceSetupSession;
  roster: AttendanceSetupPlayer[];
  cardTokens: Array<{ token: string; playerId: string; issuedAt: string }>;
};

export type ScanFeedback =
  | { type: 'success'; nickname: string }
  | { type: 'notice'; message: string }
  | { type: 'error'; message: string };
