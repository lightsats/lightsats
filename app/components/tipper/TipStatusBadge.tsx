import { Badge } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { PublicTip } from "types/PublicTip";

type TipStatusBadgeProps = {
  tip: Tip | PublicTip;
};

export function TipStatusBadge({ tip }: TipStatusBadgeProps) {
  const status = tip.status;
  const color =
    status === "UNFUNDED"
      ? "error"
      : (status === "UNCLAIMED" && !tip.claimLinkViewed) ||
        status === "RECLAIMED"
      ? "warning"
      : status === "CLAIMED" || (status === "UNCLAIMED" && tip.claimLinkViewed)
      ? "primary"
      : status === "WITHDRAWN"
      ? "success"
      : "default";

  return (
    <Badge
      variant="flat"
      color={color}
      css={{
        letterSpacing: 0,
        textTransform: "capitalize",
      }}
    >
      {status !== "UNCLAIMED"
        ? status.toLowerCase()
        : tip.claimLinkViewed
        ? "👀 Seen"
        : "🙈 Unseen"}
    </Badge>
  );
}
