import { Text } from "@nextui-org/react";
import { TipStatus } from "@prisma/client";

export function TipStatusBadge({ status }: { status: TipStatus }) {
  return (
    <Text
      b
      css={{
        color:
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
      {status[0].toUpperCase() + status.slice(1).toLowerCase()}
    </Text>
  );
}
