import { defaultFetcher } from "lib/swr";
import useSWR from "swr";
import { Scoreboard } from "types/Scoreboard";

export function useScoreboardPosition(userId: string | undefined) {
  const { data: scoreboard } = useSWR<Scoreboard>(
    userId ? `/api/scoreboard` : undefined,
    defaultFetcher
  );

  const placing = scoreboard
    ? scoreboard.entries.findIndex((entry) => entry.userId === userId) + 1
    : undefined;
  return placing;
}
