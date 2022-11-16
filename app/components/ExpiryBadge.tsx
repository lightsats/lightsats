import { Badge, Tooltip } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { formatDistance, formatDistanceStrict, isAfter } from "date-fns";
import { expirableTipStatuses } from "lib/constants";
import { PublicTip } from "types/PublicTip";

type Props = {
  tip: PublicTip | Tip;
  viewing: "tipper" | "tippee";
};

export function ExpiryBadge({ tip, viewing }: Props) {
  const hasExpired =
    expirableTipStatuses.indexOf(tip.status) >= 0 &&
    isAfter(new Date(), new Date(tip.expiry));

  return (
    <Tooltip
      color="primary"
      placement="right"
      content={
        viewing === "tippee"
          ? hasExpired
            ? "You were too slow. This tip has expired 😭"
            : "This tip will expire. Better hurry up! ✌️"
          : hasExpired
          ? `Your recipient didn't withdraw their tip in time. This tip expired ${formatDistanceStrict(
              Date.now(),
              new Date(tip.expiry)
            )} ago 😭`
          : "Your recipient will receive occasional reminders to claim and withdraw their tip before it expires ✌️"
      }
    >
      <Badge variant="flat" color={hasExpired ? "error" : "warning"} size="xs">
        {!hasExpired && (
          <>⌛ {formatDistance(Date.now(), new Date(tip.expiry))}</>
        )}
        {hasExpired && <>Expired</>}
      </Badge>
    </Tooltip>
  );
}
