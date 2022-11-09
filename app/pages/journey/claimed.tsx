import { Grid } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { ClaimedTipCard } from "components/ClaimedTipCard";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React from "react";
import useSWR from "swr";
import { PublicTip } from "types/PublicTip";

const ClaimedPage: NextPage = () => {
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
      <h2>Nice work!</h2>
      <h4>{"You've successfully claimed your tip"}</h4>
      <Grid.Container gap={2}>
        {claimedTips?.map((tip) => (
          <ClaimedTipCardGridItem key={tip.id} tip={tip} />
        ))}
      </Grid.Container>
      <MyBitcoinJourneyFooter
        href={Routes.journeyBitcoin}
        text={<>What is Bitcoin?</>}
      />
    </>
  );
};

export default ClaimedPage;

type ClaimedTipCardItemProps = { tip: Tip };
// this is inefficient as it does 1 call per tipper, but most users will probably only have one tipper
function ClaimedTipCardGridItem({ tip }: ClaimedTipCardItemProps) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tip.id}`,
    defaultFetcher
  );

  return (
    <Grid key={tip.id} xs={12}>
      <ClaimedTipCard publicTip={publicTip} />
    </Grid>
  );
}
