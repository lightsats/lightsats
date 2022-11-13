import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

export function TipStatusBadge({ status }: { status: TipStatus }) {
  return (
    <Badge
      variant="flat"
      css={{
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
      {status}
    </Badge>
  );
}
