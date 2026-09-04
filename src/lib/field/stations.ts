export type StationDraft = {
  label: string;
  playerIds: string[];
};

/** Bagi pemain merata ke N pos (urutan roster tetap). */
export function splitPlayersEvenly(playerIds: string[], stationCount: number): string[][] {
  if (stationCount < 1) return [];
  const buckets: string[][] = Array.from({ length: stationCount }, () => []);
  playerIds.forEach((playerId, index) => {
    buckets[index % stationCount]!.push(playerId);
  });
  return buckets;
}

/** Geser assignment pemain satu pos ke kanan (rotasi). */
export function rotateStationAssignments(stations: StationDraft[]): StationDraft[] {
  if (stations.length < 2) return stations;
  const playerGroups = stations.map((s) => [...s.playerIds]);
  const rotated = playerGroups.map((_, index) => {
    const source = playerGroups[(index + playerGroups.length - 1) % playerGroups.length]!;
    return [...source];
  });
  return stations.map((station, index) => ({
    ...station,
    playerIds: rotated[index] ?? [],
  }));
}

export function defaultStationLabels(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Pos ${i + 1}`);
}
