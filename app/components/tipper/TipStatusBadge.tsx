import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

export function TipStatusBadge({ status }: { status: TipStatus }) {
  return (
    <Badge
      css={{
        letterSpacing: 0,
        textTransform: "capitalize",
        backgroundColor:
          status === "UNFUNDED"
            ? "$error"
            : status === "UNCLAIMED" || status === "RECLAIMED"
            ? "warning"
            : status === "CLAIMED"
            ? "$primary"
            : status === "WITHDRAWN"
            ? "$success"
            : "$default",
      }}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
