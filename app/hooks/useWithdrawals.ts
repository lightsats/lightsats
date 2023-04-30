import { defaultFetcher } from "lib/swr";
import { useSession } from "next-auth/react";
import useSWR, { SWRConfiguration } from "swr";
import { WithdrawalWithPublicTips } from "types/WithdrawalWithPublicTips";

const pollTipsConfig: SWRConfiguration = { refreshInterval: 1000 };

export function useWithdrawals(poll = false) {
  const { data: session } = useSession();
  return useSWR<WithdrawalWithPublicTips[]>(
    session ? "/api/withdrawals" : null,
    defaultFetcher,
    poll ? pollTipsConfig : undefined
  );
}
