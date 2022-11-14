import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

export function TipStatusBadge({ status }: { status: TipStatus }) {
  const color =
    status === "UNFUNDED"
      ? "error"
      : status === "UNCLAIMED" || status === "RECLAIMED"
      ? "warning"
      : status === "CLAIMED"
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
      {status.toLowerCase()}
    </Badge>
  );
}
