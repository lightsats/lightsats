import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_LEADERBOARD_ID } from "lib/constants";
import { defaultFetcher } from "lib/swr";
import useSWR, { SWRConfiguration } from "swr";
import { LeaderboardContents } from "types/LeaderboardContents";

const pollLeaderboardConfig: SWRConfiguration = { refreshInterval: 15000 };

export function useLeaderboardContents(leaderboardId?: string) {
  return useSWR<LeaderboardContents>(
    `${ApiRoutes.leaderboards}/${
      leaderboardId ?? DEFAULT_LEADERBOARD_ID
    }/contents`,
    defaultFetcher,
    pollLeaderboardConfig
  );
}
