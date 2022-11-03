import {
  Avatar,
  Card,
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { FiatPrice } from "components/FiatPrice";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { formatDistanceStrict } from "date-fns";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import useSWR from "swr";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";

const WhatIsBitcoinPage: NextPage = () => {
  const session = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/tippee/tips` : null,
    defaultFetcher
  );
  const claimedTips = React.useMemo(
    () => tips?.filter((tip) => tip.status === "CLAIMED"),
    [tips]
  );
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <h4>Nice work!</h4>
      <h6>{"You've successfully claimed your tip"}</h6>
      <Grid.Container gap={2}>
        {claimedTips?.map((tip) => (
          <ClaimedTipCard key={tip.id} tip={tip} />
        ))}
      </Grid.Container>
      <Spacer y={2} />
      <MyBitcoinJourneyContent>
        <Text h4>{"This isn't a normal tip."}</Text>
        <Text h3 color="warning">
          {"It's a Bitcoin tip."}
        </Text>
      </MyBitcoinJourneyContent>

      <MyBitcoinJourneyFooter
        href={Routes.journeyBitcoin}
        text={<>What is Bitcoin?</>}
      />
    </>
  );
};

export default WhatIsBitcoinPage;

type ClaimedTipCardProps = { tip: Tip };
// this is inefficient as it does 1 call per tipper, but most users will probably only have one tipper
function ClaimedTipCard({ tip }: ClaimedTipCardProps) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tip.id}`,
    defaultFetcher
  );
  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );
  if (!publicTip) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <Grid key={tip.id} xs={12}>
      <Card css={{ background: "$gray900" }}>
        <Card.Body>
          <Row align="center">
            <Avatar
              src={getAvatarUrl(
                publicTip.tipper.avatarURL ?? undefined,
                publicTip.tipper.fallbackAvatarId
              )}
              size="md"
              bordered
            />
            <Spacer x={0.5} />
            <Col>
              <Row>
                <Text b color="white">
                  {publicTip.tipper.name ?? "Anon"}
                </Text>
              </Row>
              <Row>
                <Text color="white">
                  {formatDistanceStrict(Date.now(), new Date(tip.created))} ago
                </Text>
              </Row>
            </Col>
            <Col>
              <Row justify="flex-end">
                <Text b color="white">
                  <FiatPrice
                    currency={tip.currency ?? DEFAULT_FIAT_CURRENCY}
                    sats={tip.amount}
                    exchangeRate={
                      exchangeRates?.[tip.currency ?? DEFAULT_FIAT_CURRENCY]
                    }
                  />
                </Text>
              </Row>
              <Row justify="flex-end">
                <Text color="white">{tip.amount} sats</Text>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Grid>
  );
}
