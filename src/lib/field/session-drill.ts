export type LocalSessionDrillLike = {
  id: string;
  drillId: string;
  stationId?: string | null;
};

export function findLocalSessionDrill<T extends LocalSessionDrillLike>(
  rows: T[],
  drillId: string,
  stationId?: string | null,
): T | undefined {
  return rows.find((row) => {
    if (row.drillId !== drillId) return false;
    if (stationId) return row.stationId === stationId;
    return !row.stationId;
  });
}
