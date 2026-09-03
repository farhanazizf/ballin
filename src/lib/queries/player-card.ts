import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateAge } from '@/lib/utils';

export type PlayerShape = {
  shooting: number;
  finishing: number;
  ballhandling: number;
  defense: number;
  athleticism: number;
  attitude: number;
};

export type PlayerCardData = {
  id: string;
  nickname: string;
  fullName: string;
  jerseyNumber: number | null;
  age: number | null;
  className: string | null;
  archetype: string | null;
  photoUrl: string | null;
  currentShape: PlayerShape | null;
  previousShape: PlayerShape | null;
  periodStart: string | null;
  periodEnd: string | null;
  dataSufficient: boolean;
  hasAttributes: boolean;
};

export type RecentDrillStat = {
  name: string;
  made?: number;
  attempts?: number;
  value?: number;
  unit?: string | null;
  lowerIsBetter?: boolean;
  prevMade?: number;
  prevAttempts?: number;
  prevValue?: number;
};

export type PersonalBest = {
  drill: string;
  score: string;
  date: string;
};

export type PlayerBadge = {
  code: string;
  name: string;
  earned: boolean;
  earnedAt?: string;
};

type PlayerCardViewRow = {
  id: string;
  nickname: string;
  jersey_number: number | null;
  archetype: string | null;
  shape_shooting: number | null;
  shape_finishing: number | null;
  shape_ballhandling: number | null;
  shape_defense: number | null;
  shape_athleticism: number | null;
  shape_attitude: number | null;
  period_start: string | null;
  period_end: string | null;
  data_sufficient: boolean | null;
};

type DrillResultRow = {
  made: number;
  attempts: number;
  value: number | null;
  is_dnp: boolean;
  updated_at: string;
  session_drills: {
    drill_id: string;
    drills: {
      name: string;
      type: string;
      unit: string | null;
      lower_is_better: boolean;
    };
  };
};

type AttendanceRow = {
  session_date: string;
  status: string;
};

function formatShortDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function rowToShape(row: PlayerCardViewRow): PlayerShape {
  return {
    shooting: Number(row.shape_shooting ?? 0),
    finishing: Number(row.shape_finishing ?? 0),
    ballhandling: Number(row.shape_ballhandling ?? 0),
    defense: Number(row.shape_defense ?? 0),
    athleticism: Number(row.shape_athleticism ?? 0),
    attitude: Number(row.shape_attitude ?? 0),
  };
}

function isPresentStatus(status: string): boolean {
  return status === 'present' || status === 'late';
}

function formatAttemptScore(made: number, attempts: number): string {
  return `${made}/${attempts}`;
}

function formatTimedScore(value: number, unit: string | null): string {
  const unitLabel = unit === 'detik' || unit === 's' ? 'dtk' : (unit ?? '');
  return unitLabel ? `${value} ${unitLabel}` : String(value);
}

function isBetterResult(
  current: DrillResultRow,
  candidate: DrillResultRow,
  lowerIsBetter: boolean,
): boolean {
  const drillType = current.session_drills.drills.type;

  if (drillType === 'attempt' || drillType === 'count_in_time') {
    const currentRatio = current.attempts > 0 ? current.made / current.attempts : 0;
    const candidateRatio = candidate.attempts > 0 ? candidate.made / candidate.attempts : 0;
    if (candidateRatio !== currentRatio) {
      return candidateRatio > currentRatio;
    }
    return candidate.made > current.made;
  }

  const currentValue = Number(current.value ?? 0);
  const candidateValue = Number(candidate.value ?? 0);
  return lowerIsBetter ? candidateValue < currentValue : candidateValue > currentValue;
}

export async function getPlayerIdForProfile(profileId: string): Promise<string | null> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('players')
    .select('id')
    .eq('profile_id', profileId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function getPlayerCard(playerId: string): Promise<PlayerCardData | null> {
  const supabase = await createServerSupabaseClient();

  const [{ data: player }, { data: cardRows }, { data: classData }] = await Promise.all([
    supabase
      .from('players')
      .select('id, nickname, full_name, birth_date, jersey_number, photo_path')
      .eq('id', playerId)
      .maybeSingle(),
    supabase
      .from('player_card_view')
      .select(
        'id, nickname, jersey_number, archetype, shape_shooting, shape_finishing, shape_ballhandling, shape_defense, shape_athleticism, shape_attitude, period_start, period_end, data_sufficient',
      )
      .eq('id', playerId)
      .order('period_start', { ascending: false, nullsFirst: false }),
    supabase
      .from('attendance')
      .select('sessions!inner(teams!inner(name))')
      .eq('player_id', playerId)
      .order('session_date', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!player) {
    return null;
  }

  const periods = (cardRows ?? []) as PlayerCardViewRow[];
  const currentPeriod = periods.find((row) => row.period_start != null) ?? null;
  const previousPeriod =
    periods.find(
      (row) => row.period_start != null && row.period_start !== currentPeriod?.period_start,
    ) ?? null;

  const className =
    (classData as { sessions?: { teams?: { name?: string } } } | null)?.sessions?.teams?.name ??
    null;

  let photoUrl: string | null = null;
  if (player.photo_path) {
    const { data: signed } = await supabase.storage
      .from('player-photos')
      .createSignedUrl(player.photo_path, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  const hasAttributes = currentPeriod?.period_start != null;

  return {
    id: player.id,
    nickname: player.nickname,
    fullName: player.full_name,
    jerseyNumber: player.jersey_number,
    age: player.birth_date ? calculateAge(player.birth_date) : null,
    className,
    archetype: currentPeriod?.archetype ?? null,
    photoUrl,
    currentShape: currentPeriod ? rowToShape(currentPeriod) : null,
    previousShape: previousPeriod ? rowToShape(previousPeriod) : null,
    periodStart: currentPeriod?.period_start ?? null,
    periodEnd: currentPeriod?.period_end ?? null,
    dataSufficient: currentPeriod?.data_sufficient ?? false,
    hasAttributes,
  };
}

export async function getRecentDrills(playerId: string, limit = 6): Promise<RecentDrillStat[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('drill_results')
    .select(
      `
      made,
      attempts,
      value,
      is_dnp,
      updated_at,
      session_drills!inner (
        drill_id,
        drills!inner (
          name,
          type,
          unit,
          lower_is_better
        )
      )
    `,
    )
    .eq('player_id', playerId)
    .eq('is_dnp', false)
    .order('updated_at', { ascending: false })
    .limit(40);

  const rows = (data ?? []) as DrillResultRow[];
  const byDrill = new Map<string, DrillResultRow[]>();

  for (const row of rows) {
    const drillId = row.session_drills.drill_id;
    const existing = byDrill.get(drillId) ?? [];
    existing.push(row);
    byDrill.set(drillId, existing);
  }

  const stats: RecentDrillStat[] = [];

  for (const drillRows of byDrill.values()) {
    if (stats.length >= limit) break;

    const [latest, previous] = drillRows;
    const drill = latest.session_drills.drills;
    const drillType = drill.type;

    if (drillType === 'attempt' || drillType === 'count_in_time') {
      stats.push({
        name: drill.name,
        made: latest.made,
        attempts: latest.attempts,
        prevMade: previous?.made,
        prevAttempts: previous?.attempts,
      });
      continue;
    }

    if (latest.value == null) continue;

    stats.push({
      name: drill.name,
      value: Number(latest.value),
      unit: drill.unit,
      lowerIsBetter: drill.lower_is_better,
      prevValue: previous?.value != null ? Number(previous.value) : undefined,
    });
  }

  return stats.slice(0, limit);
}

export async function getPersonalBests(playerId: string): Promise<PersonalBest[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('drill_results')
    .select(
      `
      made,
      attempts,
      value,
      is_dnp,
      updated_at,
      session_drills!inner (
        drill_id,
        drills!inner (
          name,
          type,
          unit,
          lower_is_better
        )
      )
    `,
    )
    .eq('player_id', playerId)
    .eq('is_dnp', false);

  const rows = (data ?? []) as DrillResultRow[];
  const bestByDrill = new Map<string, DrillResultRow>();

  for (const row of rows) {
    const drillId = row.session_drills.drill_id;
    const existing = bestByDrill.get(drillId);
    if (!existing) {
      bestByDrill.set(drillId, row);
      continue;
    }

    const lowerIsBetter = row.session_drills.drills.lower_is_better;
    if (isBetterResult(row, existing, lowerIsBetter)) {
      bestByDrill.set(drillId, row);
    }
  }

  return Array.from(bestByDrill.values())
    .map((row) => {
      const drill = row.session_drills.drills;
      const score =
        drill.type === 'attempt' || drill.type === 'count_in_time'
          ? formatAttemptScore(row.made, row.attempts)
          : formatTimedScore(Number(row.value ?? 0), drill.unit);

      return {
        drill: drill.name,
        score,
        date: formatShortDate(row.updated_at),
      };
    })
    .slice(0, 8);
}

export async function getPlayerBadges(playerId: string): Promise<PlayerBadge[]> {
  const supabase = await createServerSupabaseClient();

  const { data: player } = await supabase
    .from('players')
    .select('organization_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!player) {
    return [];
  }

  const [{ data: badges }, { data: earned }] = await Promise.all([
    supabase
      .from('badges')
      .select('id, code, name')
      .eq('organization_id', player.organization_id)
      .order('name'),
    supabase
      .from('player_badges')
      .select('badge_id, earned_at')
      .eq('player_id', playerId),
  ]);

  const earnedMap = new Map(
    (earned ?? []).map((entry) => [entry.badge_id, entry.earned_at as string]),
  );

  return (badges ?? []).map((badge) => {
    const earnedAt = earnedMap.get(badge.id);
    return {
      code: badge.code,
      name: badge.name,
      earned: Boolean(earnedAt),
      earnedAt: earnedAt ? formatShortDate(earnedAt) : undefined,
    };
  });
}

export async function getAttendanceStreak(playerId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('attendance')
    .select('session_date, status')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false });

  const records = (data ?? []) as AttendanceRow[];
  let streak = 0;

  for (const record of records) {
    if (isPresentStatus(record.status)) {
      streak += 1;
      continue;
    }
    if (record.status === 'excused' || record.status === 'sick') {
      continue;
    }
    break;
  }

  return streak;
}

export async function getRecentSessionDots(
  playerId: string,
  limit = 8,
): Promise<boolean[]> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('attendance')
    .select('session_date, status')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false })
    .limit(limit);

  const records = (data ?? []) as AttendanceRow[];

  return records.reverse().map((record) => isPresentStatus(record.status));
}

export function buildRadarData(
  current: PlayerShape | null,
  previous: PlayerShape | null,
): Array<{ attr: string; current: number; previous: number }> {
  if (!current) {
    return [];
  }

  const prev = previous ?? current;

  return [
    { attr: 'Shooting', current: current.shooting, previous: prev.shooting },
    { attr: 'Finishing', current: current.finishing, previous: prev.finishing },
    { attr: 'Ballhandling', current: current.ballhandling, previous: prev.ballhandling },
    { attr: 'Defense', current: current.defense, previous: prev.defense },
    { attr: 'Athleticism', current: current.athleticism, previous: prev.athleticism },
    { attr: 'Attitude', current: current.attitude, previous: prev.attitude },
  ];
}
