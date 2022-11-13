import { Badge, Tooltip } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { formatDistance, isAfter } from "date-fns";
import { expirableTipStatuses } from "lib/constants";
import { PublicTip } from "types/PublicTip";

type Props = {
  tip: PublicTip | Tip;
};

export function ExpiryBadge(props: Props) {
  // {publicTip.expiry && (
  //   <>
  //     &nbsp;
  //     {!hasExpired &&
  //       expirableTipStatuses.indexOf(tip.status) > -1 && (
  //         <>
  //           <Spacer />
  //           <Tooltip
  //             content="This tip will expire. Hurry up! ✌️"
  //             color="primary"
  //           >
  //             <Badge variant="flat" color="warning" size="md">
  //               ⌛{" "}
  //               {formatDistance(new Date(tip.expiry), Date.now())}
  //             </Badge>
  //           </Tooltip>
  //           <Spacer />
  //         </>
  //       )}
  //     <Badge variant="flat" color="warning" size="xs">
  //       ⌛ {formatDistance(Date.now(), new Date(publicTip.expiry))}
  //     </Badge>
  //   </>
  // )}

  const hasExpired =
    expirableTipStatuses.indexOf(props.tip.status) >= 0 &&
    isAfter(new Date(), new Date(props.tip.expiry));

  return (
    <Tooltip
      color="primary"
      content="This tip will expire. Better hurry up! ✌️"
    >
      <Badge
        variant="flat"
        color={hasExpired ? "error" : "warning"}
        size="xs"
        css={{ ml: 10 }}
      >
        {!hasExpired && (
          <>⌛ {formatDistance(Date.now(), new Date(props.tip.expiry))}</>
        )}
        {hasExpired && <>Expired</>}
      </Badge>
    </Tooltip>
  );
}
