import { defaultFetcher } from "lib/swr";
import useSWR, { SWRConfiguration } from "swr";
import { PublicTip } from "types/PublicTip";

// poll tip status once per second to receive updates TODO: consider using websockets
const pollPublicTipConfig: SWRConfiguration = { refreshInterval: 1000 };

export function usePublicTip(tipId: string | undefined, poll: boolean) {
  return useSWR<PublicTip>(
    tipId ? `/api/tippee/tips/${tipId}` : undefined,
    defaultFetcher,
    poll ? pollPublicTipConfig : undefined
  );
}
