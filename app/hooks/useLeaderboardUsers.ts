import { LeaderboardUser } from "@prisma/client";
import { ApiRoutes } from "lib/ApiRoutes";
import { defaultFetcher } from "lib/swr";
import useSWR, { SWRConfiguration } from "swr";

const pollLeaderboardConfig: SWRConfiguration = { refreshInterval: 15000 };

export function useLeaderboardUsers(leaderboardId: string | undefined) {
  return useSWR<LeaderboardUser[]>(
    leaderboardId ? `${ApiRoutes.leaderboards}/${leaderboardId}/users` : null,
    defaultFetcher,
    pollLeaderboardConfig
  );
}
