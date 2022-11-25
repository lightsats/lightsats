import { Tip } from "@prisma/client";
import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";

const pollTipConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useTip(
  id: string,
  poll = false,
  func: typeof useSWR | typeof useSWRImmutable = useSWR
) {
  const { data: session } = useSession();
  return func<Tip>(
    session && id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher,
    poll ? pollTipConfig : undefined
  );
}
