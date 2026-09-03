import { db } from '@/lib/db';
import type { AttendanceSetupData } from '@/lib/attendance/types';

export async function cacheAttendanceSetup(data: AttendanceSetupData): Promise<void> {
  await db.sessions.put({
    id: data.session.id,
    teamId: data.session.teamId,
    status: data.session.status as 'scheduled' | 'active' | 'completed' | 'cancelled',
    scheduledStart: data.session.scheduledStart,
    scheduledEnd: data.session.scheduledEnd,
    location: data.session.location,
    sessionType: data.session.sessionType,
  });

  await db.players.bulkPut(
    data.roster.map((player) => ({
      id: player.id,
      teamIds: [data.session.teamId],
      fullName: player.fullName,
      nickname: player.nickname,
      birthDate: '2000-01-01',
      jerseyNumber: player.jerseyNumber ?? undefined,
      status: 'active',
    })),
  );

  if (data.cardTokens.length > 0) {
    await db.cardTokens.bulkPut(
      data.cardTokens.map((card) => ({
        token: card.token,
        playerId: card.playerId,
        issuedAt: card.issuedAt,
      })),
    );
  }

  await db.localAttendance.bulkPut(
    data.roster
      .filter((player) => player.status)
      .map((player) => ({
        key: `${data.session.id}:${player.id}`,
        sessionId: data.session.id,
        playerId: player.id,
        sessionDate: data.session.sessionDate,
        status: player.status!,
        method: player.method ?? 'manual',
        checkedInAt: new Date().toISOString(),
        recordedBy: '',
      })),
  );
}

export async function loadCachedAttendanceSetup(
  sessionId: string,
): Promise<AttendanceSetupData | null> {
  const session = await db.sessions.get(sessionId);
  if (!session) {
    return null;
  }

  const players = await db.players
    .where('teamIds')
    .equals(session.teamId)
    .toArray();

  if (players.length === 0) {
    return null;
  }

  const cardTokens = await db.cardTokens.toArray();
  const cardPlayerIds = new Set(cardTokens.map((card) => card.playerId));
  const attendanceRows = await db.localAttendance.where('sessionId').equals(sessionId).toArray();
  const attendanceMap = new Map(attendanceRows.map((row) => [row.playerId, row]));

  const roster = players
    .map((player) => {
      const attendance = attendanceMap.get(player.id);
      return {
        id: player.id,
        nickname: player.nickname,
        fullName: player.fullName,
        jerseyNumber: player.jerseyNumber ?? null,
        hasCard: cardPlayerIds.has(player.id),
        status: attendance?.status ?? null,
        method: (attendance?.method as AttendanceSetupData['roster'][number]['method']) ?? null,
      };
    })
    .sort((a, b) => a.nickname.localeCompare(b.nickname, 'id'));

  const rosterIds = new Set(roster.map((player) => player.id));

  return {
    session: {
      id: session.id,
      teamId: session.teamId,
      teamName: 'Kelas',
      scheduledStart: session.scheduledStart,
      scheduledEnd: session.scheduledEnd,
      location: session.location,
      status: session.status,
      sessionType: session.sessionType,
      sessionDate: new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
      }).format(new Date(session.scheduledStart)),
    },
    roster,
    cardTokens: cardTokens
      .filter((card) => rosterIds.has(card.playerId))
      .map((card) => ({
        token: card.token,
        playerId: card.playerId,
        issuedAt: card.issuedAt,
      })),
  };
}
