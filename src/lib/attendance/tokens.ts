/** Tokens for roster players that are no longer in the active set (revoked / reprinted). */
export function staleCardTokens(
  existing: Array<{ token: string; playerId: string }>,
  activeTokens: Array<{ token: string; playerId: string }>,
  rosterPlayerIds: string[],
): string[] {
  const active = new Set(activeTokens.map((token) => token.token));
  const roster = new Set(rosterPlayerIds);
  return existing
    .filter((token) => roster.has(token.playerId) && !active.has(token.token))
    .map((token) => token.token);
}
