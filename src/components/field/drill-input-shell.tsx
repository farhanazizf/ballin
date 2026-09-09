'use client';

import { DrillGrid, type DrillGridPlayer } from '@/components/field/drill-grid';
import { TimedDrillInput } from '@/components/field/timed-drill-input';
import { CountInTimeDrillInput } from '@/components/field/count-in-time-drill-input';
import { MeasureDrillInput } from '@/components/field/measure-drill-input';
import { RatingDrillInput } from '@/components/field/rating-drill-input';

export type DrillType = 'attempt' | 'timed' | 'count_in_time' | 'measure' | 'rating';

export function DrillInputShell({
  drillType,
  sessionDrillId,
  players,
  recordedBy,
  drillName,
  target,
  unit,
  lowerIsBetter,
  trackMisses = false,
}: {
  drillType: DrillType;
  sessionDrillId: string;
  players: DrillGridPlayer[];
  recordedBy: string;
  drillName: string;
  target?: number;
  unit?: string;
  lowerIsBetter?: boolean;
  trackMisses?: boolean;
}) {
  switch (drillType) {
    case 'timed':
      return (
        <TimedDrillInput
          sessionDrillId={sessionDrillId}
          players={players}
          recordedBy={recordedBy}
          drillName={drillName}
          unit={unit}
          lowerIsBetter={lowerIsBetter}
        />
      );
    case 'count_in_time':
      return (
        <CountInTimeDrillInput
          sessionDrillId={sessionDrillId}
          players={players}
          recordedBy={recordedBy}
          drillName={drillName}
          durationSec={target ?? 30}
          unit={unit}
        />
      );
    case 'measure':
      return (
        <MeasureDrillInput
          sessionDrillId={sessionDrillId}
          players={players}
          recordedBy={recordedBy}
          drillName={drillName}
          unit={unit}
        />
      );
    case 'rating':
      return (
        <RatingDrillInput
          sessionDrillId={sessionDrillId}
          players={players}
          recordedBy={recordedBy}
          drillName={drillName}
        />
      );
    case 'attempt':
    default:
      return (
        <DrillGrid
          sessionDrillId={sessionDrillId}
          players={players}
          recordedBy={recordedBy}
          drillName={drillName}
          target={target}
          trackMisses={trackMisses}
        />
      );
  }
}
