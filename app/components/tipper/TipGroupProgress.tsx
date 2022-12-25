import { Col } from "@nextui-org/react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupProgress({ tipGroup }: { tipGroup: TipGroupWithTips }) {
  const numUnclaimedTips = tipGroup.tips.filter(
    (tip) => tip.status === "UNCLAIMED"
  ).length;
  const numClaimedTips = tipGroup.tips.filter(
    (tip) => tip.status === "CLAIMED"
  ).length;
  const numWithdrawnTips = tipGroup.tips.filter(
    (tip) => tip.status === "WITHDRAWN"
  ).length;
  // const numReclaimedTips = tipGroup.tips.filter(
  //   (tip) => tip.status === "RECLAIMED"
  // ).length;
  // const numRefundedTips = tipGroup.tips.filter(
  //   (tip) => tip.status === "REFUNDED"
  // ).length;
  const numOtherTips =
    tipGroup.tips.length - numUnclaimedTips - numClaimedTips - numWithdrawnTips;
  //numReclaimedTips -
  //numRefundedTips;
  return (
    <Col
      css={{
        background:
          tipGroup.status === "UNFUNDED"
            ? "$error"
            : `linear-gradient(90deg, $gray 0%, $gray ${
                (numOtherTips / tipGroup.tips.length) * 100
              }%, $warning ${
                (numOtherTips / tipGroup.tips.length) * 100
              }%, $warning ${
                ((numOtherTips + numUnclaimedTips) / tipGroup.tips.length) * 100
              }%, $primary ${
                ((numOtherTips + numUnclaimedTips) / tipGroup.tips.length) * 100
              }%, $primary ${
                ((numOtherTips + numUnclaimedTips + numClaimedTips) /
                  tipGroup.tips.length) *
                100
              }%, $success ${
                ((numOtherTips + numUnclaimedTips + numClaimedTips) /
                  tipGroup.tips.length) *
                100
              }%, $success 100%)`,
        width: "100%",
        mx: "$10",
        height: "12px",
        borderRadius: "$base",
      }}
    />
  );
}
