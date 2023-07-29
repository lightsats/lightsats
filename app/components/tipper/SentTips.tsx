import {
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Switch,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { NewTipButton } from "components/tipper/NewTipButton";
import { SentTipCard } from "components/tipper/SentTipCard";
import { SentTipGroupCard } from "components/tipper/SentTipGroupCard";
import { useSentTipsWithGroups } from "hooks/useTips";
import { completedTipStatuses } from "lib/constants";
import { isOldTip } from "lib/utils";
import { useSession } from "next-auth/react";
import React from "react";

export function SentTips() {
  const { data: session } = useSession();
  const { data: tips } = useSentTipsWithGroups(true);
  const [showOldTips, setShowOldTips] = React.useState(false);
  const [showCompletedTips, setShowCompletedTips] = React.useState(false);

  const tipPassesFilter = React.useCallback(
    (tip: Tip) =>
      tip.status !== "DELETED" &&
      (showCompletedTips || completedTipStatuses.indexOf(tip.status) === -1) &&
      (showOldTips || !isOldTip(tip)),
    [showCompletedTips, showOldTips]
  );

  const filteredTips = tips?.filter((tip) =>
    tip.group
      ? tip.group.status !== "DELETED" &&
        tip.group.tips.some((child) => tipPassesFilter(child))
      : tipPassesFilter(tip)
  );

  if (session && !tips) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      {tips && tips.length > 0 && (
        <>
          <Row align="flex-start">
            <Col>
              <Text css={{ whiteSpace: "nowrap" }}>Show completed tips</Text>
            </Col>
            <Col css={{ ta: "right" }}>
              <Switch
                checked={showCompletedTips}
                onChange={(e) => setShowCompletedTips(e.target.checked)}
              />
            </Col>
          </Row>
          <Row align="flex-start">
            <Col>
              <Text css={{ whiteSpace: "nowrap" }}>Show old tips</Text>
            </Col>
            <Col css={{ ta: "right" }}>
              <Switch
                checked={showOldTips}
                onChange={(e) => setShowOldTips(e.target.checked)}
              />
            </Col>
          </Row>
        </>
      )}
      {filteredTips && filteredTips.length > 0 ? (
        <>
          <Grid.Container justify="center" gap={1}>
            {filteredTips.map((tip) =>
              tip.group ? (
                <SentTipGroupCard tipGroup={tip.group} key={tip.id} />
              ) : (
                <SentTipCard tip={tip} key={tip.id} />
              )
            )}
          </Grid.Container>
        </>
      ) : (
        <>
          <Text>
            {"No tips available yet, let's create your first one now!"}
          </Text>
          <Spacer />
          <NewTipButton />
        </>
      )}
    </>
  );
}
