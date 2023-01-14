import { ClaimedTipCard } from "components/ClaimedTipCard";
import { usePublicTip } from "hooks/usePublicTip";

type ClaimProgressTrackerProps = {
  tipId: string;
};

export function ClaimProgressTracker({ tipId }: ClaimProgressTrackerProps) {
  const { data: publicTip } = usePublicTip(tipId, true);

  return (
    <>
      <ClaimedTipCard publicTip={publicTip} viewing="tippee" />
    </>
  );
}
