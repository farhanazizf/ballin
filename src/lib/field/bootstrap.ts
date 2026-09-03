import { db, type LocalAttendance } from '@/lib/db';

export type FieldBootstrapPayload = {
  session: {
    id: string;
    teamId: string;
    status: string;
    scheduledStart: string;
    scheduledEnd?: string | null;
    location?: string | null;
    sessionType: string;
  };
  players: Array<{
    id: string;
    nickname: string;
    fullName: string;
    jerseyNumber?: number | null;
    teamIds: string[];
  }>;
  cardTokens: Array<{ token: string; playerId: string; issuedAt: string }>;
  drills: Array<{
    id: string;
    name: string;
    category: string;
    type: string;
    defaultTarget?: number | null;
    unit?: string | null;
    lowerIsBetter: boolean;
    attributeWeights: Record<string, number>;
    instructions?: string | null;
  }>;
  sessionDrills: Array<{
    id: string;
    sessionId: string;
    drillId: string;
    target?: number | null;
    trackMisses: boolean;
    startedAt: string;
  }>;
  attendance: Array<{
    playerId: string;
    status: string;
    sessionDate: string;
    method: string;
    checkedInAt?: string | null;
  }>;
};

export async function cacheFieldBootstrap(data: FieldBootstrapPayload) {
  await db.transaction(
    'rw',
    [
      db.sessions,
      db.players,
      db.cardTokens,
      db.drills,
      db.sessionDrills,
      db.localAttendance,
    ],
    async () => {
      await db.sessions.put({
        id: data.session.id,
        teamId: data.session.teamId,
        status: data.session.status as 'scheduled' | 'active' | 'completed' | 'cancelled',
        scheduledStart: data.session.scheduledStart,
        scheduledEnd: data.session.scheduledEnd ?? undefined,
        location: data.session.location ?? undefined,
        sessionType: data.session.sessionType,
      });

      for (const player of data.players) {
        await db.players.put({
          id: player.id,
          teamIds: player.teamIds,
          fullName: player.fullName,
          nickname: player.nickname,
          birthDate: '2000-01-01',
          jerseyNumber: player.jerseyNumber ?? undefined,
          status: 'active',
        });
      }

      for (const card of data.cardTokens) {
        await db.cardTokens.put(card);
      }

      for (const drill of data.drills) {
        await db.drills.put({
          id: drill.id,
          name: drill.name,
          category: drill.category,
          type: drill.type as 'attempt' | 'timed' | 'count_in_time' | 'measure' | 'rating',
          defaultTarget: drill.defaultTarget ?? undefined,
          unit: drill.unit ?? undefined,
          lowerIsBetter: drill.lowerIsBetter,
          attributeWeights: drill.attributeWeights,
          instructions: drill.instructions ?? undefined,
        });
      }

      for (const sd of data.sessionDrills) {
        await db.sessionDrills.put({
          id: sd.id,
          sessionId: sd.sessionId,
          drillId: sd.drillId,
          target: sd.target ?? undefined,
          trackMisses: sd.trackMisses,
          startedAt: sd.startedAt,
        });
      }

      for (const row of data.attendance) {
        await db.localAttendance.put({
          key: `${data.session.id}:${row.playerId}`,
          sessionId: data.session.id,
          playerId: row.playerId,
          sessionDate: row.sessionDate,
          status: row.status as LocalAttendance['status'],
          method: row.method,
          checkedInAt: row.checkedInAt ?? new Date().toISOString(),
          recordedBy: '',
        });
      }
    },
  );
}
