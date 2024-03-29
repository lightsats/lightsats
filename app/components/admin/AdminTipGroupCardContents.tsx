import { Row, Text } from "@nextui-org/react";
import { formatDistance } from "date-fns";
import { TipGroupWithTips } from "types/TipGroupWithTips";

type AdminTipGroupCardContentsProps = {
  tipGroup: TipGroupWithTips;
};

export function AdminTipGroupCardContents({
  tipGroup,
}: AdminTipGroupCardContentsProps) {
  return (
    <>
      <Row justify="space-between">
        <Text b>{tipGroup.id}</Text>
        <Text>{tipGroup.status}</Text>
        {tipGroup.status === "FUNDED" &&
          tipGroup.tips.some((tip) => tip.status === "UNFUNDED") && (
            <Text>Not ready yet</Text>
          )}
      </Row>
      <Row justify="space-between">
        <Text>
          {formatDistance(new Date(), new Date(tipGroup.created))} ago
        </Text>

        <Text>{tipGroup.quantity} tips</Text>
      </Row>
    </>
  );
}
