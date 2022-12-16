import { Tip, WithdrawalFlow } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";

const pollTipsConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useTips(
  flow: WithdrawalFlow | undefined,
  poll = false,
  tipId?: string
) {
  const { data: session } = useSession();
  return useSWR<Tip[]>(
    flow && session
      ? `/api/${flow}/tips${tipId ? `?tipId=${tipId}` : ""}`
      : null,
    defaultFetcher,
    poll ? pollTipsConfig : undefined
  );
}

export function useSentTips() {
  return useTips("tipper");
}

export function useReceivedTips() {
  return useTips("tippee");
}
