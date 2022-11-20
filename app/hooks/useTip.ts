import { Tip } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";

const pollTipConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useTip(id: string, poll = false) {
  const { data: session } = useSession();
  return useSWR<Tip>(
    session && id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher,
    poll ? pollTipConfig : undefined
  );
}
