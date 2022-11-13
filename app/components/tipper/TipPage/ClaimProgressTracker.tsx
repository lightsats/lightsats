import { ClaimedTipCard } from "components/ClaimedTipCard";
import { defaultFetcher } from "lib/swr";
import useSWR, { SWRConfiguration } from "swr";
import { PublicTip } from "types/PublicTip";

type ClaimProgressTrackerProps = {
  tipId: string;
};

// poll tip status once per second to receive updates TODO: consider using websockets
const usePublicTipConfig: SWRConfiguration = { refreshInterval: 1000 };

export function ClaimProgressTracker({ tipId }: ClaimProgressTrackerProps) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tipId}`,
    defaultFetcher,
    usePublicTipConfig
  );

  return (
    <>
      <ClaimedTipCard publicTip={publicTip} viewing="tippee" />
    </>
  );
}

/*
(publicTip && publicTip.tippee ? (
      <>
        
        <Spacer />
        <Progress
          value={
            (publicTip.tippee.journeyStep / bitcoinJourneyPages.length) * 100
          }
          color="success"
          status="success"
        />
        <Text blockquote>
          On page {bitcoinJourneyPages[publicTip.tippee.journeyStep - 1]}
        </Text>

        <Spacer />
      </>
      ) : (
      <Loading color="currentColor" size="sm" />
      ))*/
