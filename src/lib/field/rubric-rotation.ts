export type RubricRotationPlayer = {
  id: string;
  nickname: string;
  lastScoredAt: string | null;
};

export function pickRubricPlayers(
  roster: RubricRotationPlayer[],
  alreadyScoredIds: Set<string>,
  limit = 5,
): RubricRotationPlayer[] {
  const candidates = roster.filter((player) => !alreadyScoredIds.has(player.id));

  return [...candidates]
    .sort((a, b) => {
      const aTime = a.lastScoredAt ? new Date(a.lastScoredAt).getTime() : 0;
      const bTime = b.lastScoredAt ? new Date(b.lastScoredAt).getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, limit);
}
