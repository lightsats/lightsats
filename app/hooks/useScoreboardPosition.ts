import { defaultFetcher } from "lib/swr";
import useSWR from "swr";
import { Scoreboard } from "types/Scoreboard";

export function useScoreboardPosition() {
  const { data: scoreboard } = useSWR<Scoreboard>(
    `/api/scoreboard`,
    defaultFetcher
  );

  const placing = scoreboard
    ? scoreboard.entries.findIndex((entry) => entry.isMe) + 1
    : undefined;
  return placing;
}
