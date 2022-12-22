import { Row, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { formatDistance } from "date-fns";
import { expirableTipStatuses } from "lib/constants";
import { hasTipExpired } from "lib/utils";

type AdminTipCardContentsProps = {
  tip: Tip;
};

export function AdminTipCardContents({ tip }: AdminTipCardContentsProps) {
  return (
    <>
      <Row justify="space-between">
        <Text b>{tip.id}</Text>

        <TipStatusBadge tip={tip} />
        {tip.groupId && <Text>In a group</Text>}
      </Row>
      <Row justify="space-between">
        <Text>{formatDistance(new Date(), new Date(tip.created))} ago</Text>
        {expirableTipStatuses.indexOf(tip.status) > -1 && (
          <Text>
            {hasTipExpired(tip) ? (
              <Text color="error">{`Expired ${formatDistance(
                new Date(),
                new Date(tip.expiry)
              )} ago`}</Text>
            ) : (
              `Expires in ${formatDistance(new Date(), new Date(tip.expiry))}`
            )}
          </Text>
        )}
        <Text>
          {tip.amount}⚡ ({tip.fee} sats fee)
        </Text>
      </Row>
      {tip.note && (
        <Text size="small" i>
          Note: {tip.note}
        </Text>
      )}
      {tip.tippeeName && (
        <Text size="small" i>
          Tippee Name: {tip.tippeeName}
        </Text>
      )}
    </>
  );
}
