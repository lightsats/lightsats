import { Grid, Spacer, Text } from "@nextui-org/react";
import { ClaimedTipCard } from "components/ClaimedTipCard";
import { NextImage } from "components/NextImage";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { hasTipExpired } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import useSWR from "swr";
import { PublicTip } from "types/PublicTip";

const ClaimedPage: NextPage = () => {
  const { data: session } = useSession();
  const { data: publicTips } = useSWR<PublicTip[]>(
    session ? `/api/tippee/tips?publicTip=true` : null,
    defaultFetcher
  );
  const claimedTips = React.useMemo(
    () =>
      publicTips?.filter(
        (publicTip) =>
          publicTip.status === "CLAIMED" && !hasTipExpired(publicTip)
      ),
    [publicTips]
  );
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <Text h3>Nice work 👍</Text>
      <Text h5>{"You've successfully claimed your tip"}</Text>
      <Spacer />
      <Grid.Container gap={2}>
        {claimedTips?.map((publicTip) => (
          <ClaimedTipCard
            key={publicTip.id}
            publicTip={publicTip}
            viewing="tipper"
          />
        ))}
      </Grid.Container>
      <Spacer y={2} />
      <Text>
        {`Your tip is ready to be withdrawn into your custody. If you don't withdraw your tip before it expires, it will be returned to ${
          claimedTips?.[0]?.tipper.name ?? DEFAULT_NAME
        }.`}
      </Text>
      <Spacer y={2} />
      <Text h5>{"Let's get started on your Bitcoin journey!"}</Text>
      <NextImage src="/images/journey/rocket.png" width={100} height={100} />
      <Spacer />

      <MyBitcoinJourneyFooter
        href={Routes.journeyBitcoin}
        text={<>Start your journey</>}
        nextUp="What is bitcoin?"
      />
    </>
  );
};

export default ClaimedPage;

export { getStaticProps };
