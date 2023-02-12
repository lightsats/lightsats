import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

type TipStatusBadgeProps = {
  tip: { status: TipStatus; count?: number };
};

export function TipStatusBadge({ tip }: TipStatusBadgeProps) {
  const status = tip.status;
  const color =
    status === "UNFUNDED"
      ? "error"
      : status === "UNSEEN" || status === "RECLAIMED"
      ? "warning"
      : status === "CLAIMED" || status === "SEEN"
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
      {status === "SEEN"
        ? "👀 Seen"
        : status === "UNSEEN"
        ? "🙈 Unseen"
        : status.toLowerCase()}
      {tip.count && (
        <>
          &nbsp;
          {tip.count}
        </>
      )}
    </Badge>
  );
}
