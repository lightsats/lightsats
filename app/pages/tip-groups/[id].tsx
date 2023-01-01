import {
  Card,
  Dropdown,
  Grid,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PersonalizeTip } from "components/tipper/PersonalizeTip";
import { SentTipCard } from "components/tipper/SentTipCard";
import { TipGroupProgress } from "components/tipper/TipGroupProgress";
import { TipGroupStatusBadge } from "components/tipper/TipGroupStatusBadge";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ApiRoutes } from "lib/ApiRoutes";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { getClaimUrl } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR, { SWRConfiguration } from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const pollTipGroupConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [showClaimUrls, setShowClaimUrls] = React.useState(false);
  const [skipPersonalize, setSkipPersonalize] = React.useState(false);

  const { data: tipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher,
    pollTipGroupConfig
  );

  if (tipGroup) {
    const header = (
      <>
        <Row justify="space-between">
          <Text h3>
            👥 Group of {tipGroup.quantity} tips &nbsp;
            <TipGroupStatusBadge tipGroup={tipGroup} />
          </Text>
          <Dropdown placement="bottom-right" type="menu">
            <Dropdown.Button flat>⚙️</Dropdown.Button>
            <Dropdown.Menu aria-label="Static Actions">
              <Dropdown.Item key="edit">
                <NextLink
                  href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
                  passHref
                >
                  <a>Bulk edit</a>
                </NextLink>
              </Dropdown.Item>
              <Dropdown.Item key="copy">Copy URLs to clipboard</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Row>

        <Spacer />
        <TipGroupProgress tipGroup={tipGroup} />
        <Spacer />
      </>
    );

    const firstTip = tipGroup.tips[0];
    const unfundedTips = tipGroup.tips.filter(
      (tip) => tip.status === "UNFUNDED"
    );
    const fundedProgress =
      tipGroup && unfundedTips
        ? (1 - unfundedTips.length / tipGroup.tips.length) * 100
        : 0;
    if (tipGroup.status === "FUNDED" && fundedProgress < 100) {
      return (
        <>
          {header}
          <Text>Preparing tips...</Text>
          <Progress value={fundedProgress} />
        </>
      );
    }

    if (!skipPersonalize && (!firstTip.note || !firstTip.tippeeName)) {
      return (
        <>
          {header}
          <PersonalizeTip
            href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
            skip={() => setSkipPersonalize(true)}
            bulk
          />
        </>
      );
    }

    return (
      <>
        {header}

        {tipGroup.status === "UNFUNDED" && tipGroup.invoice && (
          <>
            <PayInvoice invoice={tipGroup.invoice} variant="tipGroup" />
            <Spacer />
          </>
        )}

        {/* <Button onClick={() => setShowClaimUrls((current) => !current)}>
          Show/Hide claim URLs
        </Button> */}
        <Spacer />
        {showClaimUrls && (
          <>
            <Card>
              <Card.Body>
                {tipGroup.tips.map((tip) => (
                  <Row key={tip.id}>
                    <Text>{getClaimUrl(tip)}</Text>
                  </Row>
                ))}
              </Card.Body>
            </Card>
            <Spacer />
          </>
        )}

        <h3>Tips</h3>
        <Grid.Container justify="center" gap={1}>
          {tipGroup.tips.map((tip) => (
            <SentTipCard tip={tip} key={tip.id} />
          ))}
        </Grid.Container>
      </>
    );
  } else {
    return (
      <>
        <Spacer y={4} />
        <Loading color="currentColor" size="lg">
          Loading...
        </Loading>
      </>
    );
  }
};

export default TipGroupPage;

export { getStaticProps, getStaticPaths };
