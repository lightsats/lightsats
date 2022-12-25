import { Badge } from "@nextui-org/react";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupStatusBadge({
  tipGroup,
}: {
  tipGroup: TipGroupWithTips;
}) {
  //css={{ background: getTipGroupBackground(tipGroup) }}
  const status = tipGroup.status;
  let color: React.ComponentProps<typeof Badge>["color"] =
    status === "UNFUNDED" ? "error" : "primary";

  if (tipGroup.tips.every((tip) => tip.status === "RECLAIMED")) {
    color = "warning";
  } else if (tipGroup.tips.every((tip) => tip.status === "REFUNDED")) {
    color = "default";
  } else if (
    tipGroup.tips.every(
      (tip) => tip.status === "WITHDRAWN" || tip.status === "REFUNDED"
    )
  ) {
    color = "success";
  }
  /*: (status === "UNCLAIMED" && !tip.claimLinkViewed) ||
        status === "RECLAIMED"
      ? "warning"
      : status === "CLAIMED" || (status === "UNCLAIMED" && tip.claimLinkViewed)
      ? "primary"
      : status === "WITHDRAWN"
      ? "success"
      : "default";*/
  return (
    <Badge
      variant="flat"
      color={color}
      css={{
        letterSpacing: 0,
        textTransform: "capitalize",
      }}
    >
      {(color === "success" ? "Completed" : status).toLowerCase()}
    </Badge>
  );
}
