import { Badge, Tooltip } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { formatDistance, formatDistanceStrict, isAfter } from "date-fns";
import { useDateFnsLocale } from "hooks/useDateFnsLocale";
import { expirableTipStatuses } from "lib/constants";
import { useTranslation } from "next-i18next";
import { PublicTip } from "types/PublicTip";

type Props = {
  tip: PublicTip | Tip;
  viewing: "tipper" | "tippee";
};

export function ExpiryBadge({ tip, viewing }: Props) {
  const dateFnsLocale = useDateFnsLocale();
  const hasExpired =
    expirableTipStatuses.indexOf(tip.status) >= 0 &&
    isAfter(new Date(), new Date(tip.expiry));
  const { t } = useTranslation("tip");

  return (
    <Tooltip
      color="primary"
      placement="right"
      content={
        viewing === "tipper"
          ? hasExpired
            ? t("tippee.expired")
            : t("tippee.willExpire")
          : hasExpired
          ? t("tipper.expired", {
              distance: formatDistanceStrict(Date.now(), new Date(tip.expiry), {
                locale: dateFnsLocale,
              }),
            })
          : t("tipper.willExpire")
      }
    >
      <Badge variant="flat" color={hasExpired ? "error" : "warning"} size="xs">
        {!hasExpired && (
          <>
            ⌛{" "}
            {formatDistance(Date.now(), new Date(tip.expiry), {
              locale: dateFnsLocale,
            })}
          </>
        )}
        {hasExpired && <>⌛ Expired</>}
      </Badge>
    </Tooltip>
  );
}
