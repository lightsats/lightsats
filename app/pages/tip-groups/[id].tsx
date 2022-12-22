import { Grid, Loading, Progress, Spacer, Text } from "@nextui-org/react";
import { SentTipCard } from "components/tipper/SentTipCard";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ApiRoutes } from "lib/ApiRoutes";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR, { SWRConfiguration } from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const pollTipGroupConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: tipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher,
    pollTipGroupConfig
  );

  // const hasExpired = tipGroup && hasTipExpired(tipGroup.tips[0]); // FIXME: individual tips could have different expiry

  if (tipGroup) {
    if (tipGroup.status === "FUNDED") {
      return (
        <>
          <Text>Preparing tips...</Text>
          <Progress value={0} color="primary" />
        </>
      );
    }

    return (
      <>
        <Text h1>Tip Group</Text>
        <Text>{tipGroup.status}</Text>
        <Text>{tipGroup.quantity} tips</Text>
        <Text>
          {(tipGroup.tips[0].amount + tipGroup.tips[0].fee) * tipGroup.quantity}{" "}
          sats
        </Text>
        {tipGroup.status === "UNFUNDED" && tipGroup.invoice && (
          <>
            <PayInvoice invoice={tipGroup.invoice} variant="tipGroup" />
            <Spacer />
          </>
        )}
        <Text h6>Manage Tips</Text>
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
