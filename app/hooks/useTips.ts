import { Tip } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";

const pollTipsConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useTips(flow: "tipper" | "tippee", poll = false) {
  const { data: session } = useSession();
  return useSWR<Tip[]>(
    session ? `/api/${flow}/tips` : null,
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
