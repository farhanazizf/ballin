import Dexie, { type EntityTable } from 'dexie';

// Types for local storage
export interface LocalSession {
  id: string;
  teamId: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  scheduledStart: string;
  scheduledEnd?: string;
  location?: string;
  sessionType: string;
  openedAt?: string;
  closedAt?: string;
  notes?: string;
}

export interface LocalPlayer {
  id: string;
  teamIds: string[];
  fullName: string;
  nickname: string;
  birthDate: string;
  jerseyNumber?: number;
  position?: string;
  photoPath?: string;
  status: string;
}

export interface LocalCardToken {
  token: string;
  playerId: string;
  issuedAt: string;
}

export interface LocalDrill {
  id: string;
  name: string;
  category: string;
  type: 'attempt' | 'timed' | 'count_in_time' | 'measure' | 'rating';
  defaultTarget?: number;
  unit?: string;
  lowerIsBetter: boolean;
  attributeWeights: Record<string, number>;
  instructions?: string;
}

export interface LocalSessionDrill {
  id: string;
  sessionId: string;
  stationId?: string;
  drillId: string;
  target?: number;
  trackMisses: boolean;
  startedAt: string;
  finishedAt?: string;
}

export interface LocalDrillEvent {
  clientEventId: string;
  sessionDrillId: string;
  playerId: string;
  result: 'made' | 'miss' | 'dnp';
  value?: number;
  occurredAt: string;
  deviceId: string;
  recordedBy: string;
  voidedAt?: string;
}

export interface OutboxItem {
  seq?: number;
  clientEventId: string;
  payload: Record<string, unknown>;
  table: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  retries: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

class BallinDB extends Dexie {
  sessions!: EntityTable<LocalSession, 'id'>;
  players!: EntityTable<LocalPlayer, 'id'>;
  cardTokens!: EntityTable<LocalCardToken, 'token'>;
  drills!: EntityTable<LocalDrill, 'id'>;
  sessionDrills!: EntityTable<LocalSessionDrill, 'id'>;
  localEvents!: EntityTable<LocalDrillEvent, 'clientEventId'>;
  outbox!: EntityTable<OutboxItem, 'seq'>;

  constructor() {
    super('ballin');
    
    this.version(1).stores({
      sessions: 'id, teamId, status',
      players: 'id, *teamIds',
      cardTokens: 'token, playerId',
      drills: 'id, category',
      sessionDrills: 'id, sessionId',
      localEvents: 'clientEventId, sessionDrillId, playerId',
      outbox: '++seq, clientEventId, status, createdAt',
    });
  }
}

export const db = new BallinDB();
