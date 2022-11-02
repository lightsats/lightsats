import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { Badge, Card, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Icon } from "components/Icon";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import ISO6391 from "iso-639-1";
import { getRecommendedWallets, sortWallets } from "lib/getRecommendedWallets";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { wallets } from "lib/wallets";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import NextImage from "next/image";
import NextLink from "next/link";
import React from "react";
import useSWR from "swr";
import { Wallet } from "types/LightningWallet";

const SelectWalletPage: NextPage = () => {
  const session = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/tippee/tips` : null,
    defaultFetcher
  );

  const claimedTips = React.useMemo(
    () => tips?.filter((tip) => tip.status === "CLAIMED"),
    [tips]
  );
  const recommendedWallets = React.useMemo(
    () =>
      getRecommendedWallets(
        claimedTips?.length
          ? claimedTips.map((tip) => tip.amount).reduce((a, b) => a + b)
          : 0,
        "en"
      ),
    [claimedTips]
  );
  const otherWallets = React.useMemo(() => {
    const otherWallets = wallets.filter(
      (wallet) => recommendedWallets.indexOf(wallet) === -1
    );
    sortWallets(otherWallets);
    return otherWallets;
  }, [recommendedWallets]);

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Choose a Wallet</title>
      </Head>
      <MyBitcoinJourneyHeader />

      <MyBitcoinJourneyContent>
        <h4>Recommended Wallets</h4>
        <Grid.Container gap={1} justify="center">
          {recommendedWallets.map((wallet) => (
            <WalletCard key={wallet.name} wallet={wallet} />
          ))}
        </Grid.Container>
        {otherWallets.length > 0 && (
          <>
            <Spacer />
            <h4>More Wallets</h4>
            <Grid.Container gap={1} justify="center">
              {otherWallets.map((wallet) => (
                <WalletCard key={wallet.name} wallet={wallet} />
              ))}
            </Grid.Container>
          </>
        )}
        <Spacer />
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={Routes.withdraw}
        text={"I've installed a wallet"}
      />
    </>
  );
};

export default SelectWalletPage;

type WalletCardProps = {
  wallet: Wallet;
};

function WalletCard({ wallet }: WalletCardProps) {
  const hasLanguage = wallet.languageCodes.indexOf("en") > -1;
  const getIcon = (success: boolean) => (
    <Icon width={12} height={12}>
      {success ? <CheckIcon /> : <ExclamationCircleIcon />}
    </Icon>
  );

  return (
    <Grid xs={12} justify="center">
      <NextLink href={wallet.link}>
        <a target="_blank" style={{ width: "100%" }}>
          <Card css={{ background: "$gray900" }} isPressable isHoverable>
            <Card.Body>
              <Row align="center" style={{ height: "100%" }}>
                <NextImage
                  alt=""
                  width={64}
                  height={64}
                  src={`/wallets/${wallet.image}`}
                  style={{ borderRadius: "8px" }}
                />
                <Spacer x={0.5} />
                <Col>
                  <Row>
                    <Text b color="white">
                      {wallet.name}
                    </Text>
                  </Row>
                  <Row>
                    <Text size="x-small" b css={{ color: "$gray400" }}>
                      {wallet.slogan}
                    </Text>
                  </Row>
                </Col>
                <div
                  style={{
                    alignSelf: "flex-end",
                    justifySelf: "flex-end",
                  }}
                >
                  <Badge
                    css={{
                      background: "$black",
                      borderColor: "$black",
                      color: "$warning",
                    }}
                  >
                    GET
                  </Badge>
                </div>
              </Row>
              {
                <>
                  <Spacer y={0.5} />
                  <Row style={{ flexWrap: "wrap", gap: "8px" }}>
                    <Text color="white" size="small">
                      {ISO6391.getNativeName("en")}&nbsp;
                      {getIcon(hasLanguage)}
                    </Text>
                    {wallet.minBalance > 0 && (
                      <>
                        <Text color="warning" size="small">
                          {wallet.minBalance}⚡ min balance&nbsp;
                          {getIcon(wallet.minBalance === 0)}
                        </Text>
                      </>
                    )}
                    <Text
                      color={
                        wallet.platforms.indexOf("mobile") === -1
                          ? "warning"
                          : "white"
                      }
                      size="small"
                    >
                      {wallet.platforms.join(",")}&nbsp;
                      {getIcon(wallet.platforms.indexOf("mobile") > -1)}
                    </Text>

                    {wallet.lightsatsRecommended && (
                      <Text color="success" size="small">
                        Recommended
                        {getIcon(hasLanguage)}
                      </Text>
                    )}
                  </Row>
                </>
              }
            </Card.Body>
            <Spacer y={-0.5} />
          </Card>
        </a>
      </NextLink>
    </Grid>
  );
}
