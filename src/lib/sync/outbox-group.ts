import type { OutboxItem } from '@/lib/db';


export type GroupedOutbox = {
  drillEvents: OutboxItem[];
  voids: OutboxItem[];
  attendance: OutboxItem[];
  drillResults: OutboxItem[];
  sessionDrills: OutboxItem[];
};

export function groupOutboxItems(items: OutboxItem[]): GroupedOutbox {
  return {
    drillEvents: items.filter((item) => item.table === 'drill_events'),
    voids: items.filter((item) => item.table === 'drill_events_void'),
    attendance: items.filter((item) => item.table === 'attendance'),
    drillResults: items.filter((item) => item.table === 'drill_results'),
    sessionDrills: items.filter((item) => item.table === 'session_drills'),
  };
}

export function hasSyncableOutboxItems(groups: GroupedOutbox): boolean {
  return (
    groups.drillEvents.length > 0 ||
    groups.voids.length > 0 ||
    groups.attendance.length > 0 ||
    groups.drillResults.length > 0 ||
    groups.sessionDrills.length > 0
  );
}
