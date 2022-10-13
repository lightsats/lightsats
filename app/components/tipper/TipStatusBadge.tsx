import { Badge } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

export function TipStatusBadge({ status }: { status: TipStatus }) {
  return (
    <Badge
      color={
        status === "UNFUNDED"
          ? "error"
          : status === "UNCLAIMED"
          ? "warning"
          : status === "CLAIMED"
          ? "primary"
          : status === "WITHDRAWN"
          ? "success"
          : status === "REFUNDED"
          ? "default"
          : "default"
      }
    >
      {status}
    </Badge>
  );
}
