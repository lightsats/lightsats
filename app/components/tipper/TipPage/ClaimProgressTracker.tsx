import { ClaimedTipCard } from "components/ClaimedTipCard";
import { defaultFetcher } from "lib/swr";
import useSWR, { SWRConfiguration } from "swr";
import { PublicTip } from "types/PublicTip";

type ClaimProgressTrackerProps = {
  tipId: string;
  viewing: "tipper" | "tippee";
};

// poll tip status once per second to receive updates TODO: consider using websockets
const usePublicTipConfig: SWRConfiguration = { refreshInterval: 1000 };

export function ClaimProgressTracker({
  tipId,
  viewing,
}: ClaimProgressTrackerProps) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tipId}`,
    defaultFetcher,
    usePublicTipConfig
  );

  return (
    <>
      <ClaimedTipCard publicTip={publicTip} viewing={viewing} />
    </>
  );
}
