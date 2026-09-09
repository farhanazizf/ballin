import { db, type LocalAttendance } from '@/lib/db';
import { staleCardTokens } from '@/lib/attendance/tokens';

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
    stationId?: string | null;
    drillId: string;
    target?: number | null;
    trackMisses: boolean;
    startedAt: string;
  }>;
  stations: Array<{
    id: string;
    label: string;
    coachId?: string | null;
    sortOrder: number;
    playerIds: string[];
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
      db.stations,
      db.stationPlayers,
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

      const rosterIds = data.players.map((player) => player.id);
      const existingTokens = await db.cardTokens.toArray();
      const stale = staleCardTokens(existingTokens, data.cardTokens, rosterIds);
      if (stale.length > 0) {
        await db.cardTokens.bulkDelete(stale);
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
          stationId: sd.stationId ?? undefined,
          drillId: sd.drillId,
          target: sd.target ?? undefined,
          trackMisses: sd.trackMisses,
          startedAt: sd.startedAt,
        });
      }

      const existingStations = await db.stations.where('sessionId').equals(data.session.id).toArray();
      const existingStationIds = existingStations.map((s) => s.id);
      if (existingStationIds.length > 0) {
        await db.stationPlayers.where('stationId').anyOf(existingStationIds).delete();
        await db.stations.where('sessionId').equals(data.session.id).delete();
      }

      for (const station of data.stations) {
        await db.stations.put({
          id: station.id,
          sessionId: data.session.id,
          label: station.label,
          coachId: station.coachId ?? undefined,
          sortOrder: station.sortOrder,
        });
        for (const playerId of station.playerIds) {
          await db.stationPlayers.put({
            key: `${station.id}:${playerId}`,
            stationId: station.id,
            playerId,
          });
        }
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

export async function loadCachedFieldBootstrap(sessionId: string): Promise<FieldBootstrapPayload | null> {
  const session = await db.sessions.get(sessionId);
  if (!session) return null;

  const players = await db.players.where('teamIds').equals(session.teamId).toArray();
  const drills = await db.drills.toArray();
  if (players.length === 0 || drills.length === 0) return null;

  const sessionDrills = await db.sessionDrills.where('sessionId').equals(sessionId).toArray();
  const stations = await db.stations.where('sessionId').equals(sessionId).toArray();
  const stationIds = stations.map((station) => station.id);
  const stationPlayerRows =
    stationIds.length > 0 ? await db.stationPlayers.where('stationId').anyOf(stationIds).toArray() : [];
  const cardTokens = await db.cardTokens.toArray();
  const attendance = await db.localAttendance.where('sessionId').equals(sessionId).toArray();
  const rosterIds = new Set(players.map((player) => player.id));

  return {
    session: {
      id: session.id,
      teamId: session.teamId,
      status: session.status,
      scheduledStart: session.scheduledStart,
      scheduledEnd: session.scheduledEnd,
      location: session.location,
      sessionType: session.sessionType,
    },
    players: players.map((player) => ({
      id: player.id,
      nickname: player.nickname,
      fullName: player.fullName,
      jerseyNumber: player.jerseyNumber ?? null,
      teamIds: player.teamIds,
    })),
    cardTokens: cardTokens.filter((card) => rosterIds.has(card.playerId)),
    drills: drills.map((drill) => ({
      id: drill.id,
      name: drill.name,
      category: drill.category,
      type: drill.type,
      defaultTarget: drill.defaultTarget,
      unit: drill.unit,
      lowerIsBetter: drill.lowerIsBetter,
      attributeWeights: drill.attributeWeights,
      instructions: drill.instructions,
    })),
    sessionDrills: sessionDrills.map((row) => ({
      id: row.id,
      sessionId: row.sessionId,
      stationId: row.stationId,
      drillId: row.drillId,
      target: row.target,
      trackMisses: row.trackMisses,
      startedAt: row.startedAt,
    })),
    stations: stations.map((station) => ({
      id: station.id,
      label: station.label,
      coachId: station.coachId,
      sortOrder: station.sortOrder,
      playerIds: stationPlayerRows
        .filter((row) => row.stationId === station.id)
        .map((row) => row.playerId),
    })),
    attendance: attendance.map((row) => ({
      playerId: row.playerId,
      status: row.status,
      sessionDate: row.sessionDate,
      method: row.method,
      checkedInAt: row.checkedInAt,
    })),
  };
}
