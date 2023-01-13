import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

type TipStatusBadgeProps = {
  tip: { status: TipStatus; claimLinkViewed: boolean; count?: number };
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
      {tip.count && (
        <>
          &nbsp;
          {tip.count}
        </>
      )}
    </Badge>
  );
}
