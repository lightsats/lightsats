import {
  Button,
  Card,
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
import { TipGroupSettingsDropdown } from "components/tipper/TipGroupPage/TipGroupSettingsDropdown";
import { TipGroupProgress } from "components/tipper/TipGroupProgress";
import { TipGroupStatusBadge } from "components/tipper/TipGroupStatusBadge";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ApiRoutes } from "lib/ApiRoutes";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { getDefaultBulkGiftCardTheme, isTipGroupActive } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { BulkTipGiftCardContentsPreview } from "pages/tip-groups/[id]/print";
import React from "react";
import useSWR, { SWRConfiguration } from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const pollTipGroupConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [copyIndividualLinksEnabled, setCopyIndividualLinksEnabled] =
    React.useState(false);

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
          <TipGroupSettingsDropdown
            copyIndividualLinksEnabled={copyIndividualLinksEnabled}
            setCopyIndividualLinksEnabled={() =>
              setCopyIndividualLinksEnabled((current) => !current)
            }
          />
        </Row>
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

    return (
      <>
        {header}
        {tipGroup.status === "UNFUNDED" && tipGroup.invoice && (
          <>
            <PayInvoice invoice={tipGroup.invoice} variant="tipGroup" />
            <Spacer />
          </>
        )}
        {tipGroup.status === "FUNDED" && (
          <>
            {!copyIndividualLinksEnabled && isTipGroupActive(tipGroup) && (
              <>
                <Card css={{ dropShadow: "$sm" }}>
                  <Card.Header>
                    <Row justify="space-between">
                      <Text b>{"🆕 Physical cards to print yourself"}</Text>
                      <NextLink
                        href={`${PageRoutes.tipGroups}/${tipGroup.id}/print`}
                        style={{ display: "inline-block" }}
                      >
                        <a>
                          <Button size={"sm"}>Choose design</Button>
                        </a>
                      </NextLink>
                    </Row>
                  </Card.Header>
                  <Card.Body>
                    <Card
                      css={{ dropShadow: "$sm", p: 0, scale: 0.8, mt: -25 }}
                    >
                      <BulkTipGiftCardContentsPreview
                        theme={getDefaultBulkGiftCardTheme()}
                        tip={firstTip}
                      />
                    </Card>
                  </Card.Body>
                </Card>
              </>
            )}
            <Spacer />
            <PersonalizeTip
              href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
              bulk
            />
            <Spacer />
            <Text h3>Tips</Text>
            {isTipGroupActive(tipGroup) && (
              <>
                <TipGroupProgress tipGroup={tipGroup} />
              </>
            )}
            <Spacer />
            <Grid.Container justify="center" css={{ gap: "$5" }}>
              {tipGroup.tips.map((tip) => (
                <SentTipCard
                  tip={tip}
                  key={tip.id}
                  copyIndividualLinksEnabled={copyIndividualLinksEnabled}
                />
              ))}
            </Grid.Container>
          </>
        )}
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
