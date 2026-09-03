/**
 * Attribute calculation engine
 * Runs as a cron job (Supabase pg_cron) and can be triggered manually before report generation.
 * 
 * Algorithm (from TRD section 7):
 * 1. Get drill_results for the period
 * 2. Group by drill, calculate average (or best for 'measure' type)
 * 3. Convert to percentile against age group (individual age ±1 year)
 * 4. Distribute to attributes using drills.attribute_weights
 * 5. Box scores weighted 1.5x
 * 6. Attitude = attendance(0.4) + streak(0.2) + rubric(0.4)
 * 7. If data points < 3, keep previous period value, mark data_sufficient=false
 * 8. Determine archetype (skip if archetype_locked)
 * 9. Save to player_attributes
 */

export const ARCHETYPE_RULES = {
  Shooter: { primary: 'shooting', minPercentile: 60 },
  Slasher: { primary: 'finishing', minPercentile: 60 },
  Playmaker: { primary: 'ballhandling', minPercentile: 60 },
  'Rim Protector': { primary: 'defense', minPercentile: 60 },
  Motor: { primary: 'athleticism', minPercentile: 60 },
  'Glue Guy': { primary: 'attitude', minPercentile: 0 },
} as const;

export type Archetype = keyof typeof ARCHETYPE_RULES;

export const ATTRIBUTES = [
  'shooting',
  'finishing',
  'ballhandling',
  'defense',
  'athleticism',
  'attitude',
] as const;

export type AttributeName = (typeof ATTRIBUTES)[number];

export interface AttributeValues {
  shooting: number;
  finishing: number;
  ballhandling: number;
  defense: number;
  athleticism: number;
  attitude: number;
}

export const ATTITUDE_WEIGHTS = {
  attendance: 0.4,
  streak: 0.2,
  rubric: 0.4,
} as const;

export const MATCH_STAT_WEIGHT = 1.5;
export const MIN_DATA_POINTS = 3;
export const MIN_SESSIONS_FOR_ARCHETYPE = 8;

/**
 * Calculate attributes for a player in a period.
 * To be implemented with actual Supabase queries.
 */
export async function calculatePlayerAttributes(
  _playerId: string,
  _periodStart: Date,
  _periodEnd: Date
): Promise<AttributeValues & { archetype: Archetype | null; dataSufficient: boolean }> {
  // TODO: Implement with actual data queries
  throw new Error('Not implemented');
}

/**
 * Determine archetype from attribute values.
 * Simple rule-based, not a model.
 */
export function determineArchetype(attrs: AttributeValues): Archetype {
  let highest: Archetype = 'Glue Guy';
  let highestValue = -1;

  for (const [name, rule] of Object.entries(ARCHETYPE_RULES)) {
    const value = attrs[rule.primary as AttributeName];
    if (value > highestValue && value >= rule.minPercentile) {
      highest = name as Archetype;
      highestValue = value;
    }
  }

  // Check for Glue Guy: even spread (max - min < 15)
  const values = ATTRIBUTES.map((a) => attrs[a]);
  const spread = Math.max(...values) - Math.min(...values);
  if (spread < 15 && attrs.attitude >= 60) {
    return 'Glue Guy';
  }

  return highest;
}
