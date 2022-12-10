import { useLeaderboardContents } from "hooks/useLeaderboardContents";

export function useLeaderboardPosition(userId: string | undefined) {
  const { data: leaderboard } = useLeaderboardContents();

  const placing = leaderboard
    ? leaderboard.entries.findIndex((entry) => entry.userId === userId) + 1
    : undefined;
  return placing;
}
