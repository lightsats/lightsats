import {
  Button,
  Grid,
  Loading,
  Progress,
  Spacer,
  Text,
} from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { SentTipCard } from "components/tipper/SentTipCard";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ApiRoutes } from "lib/ApiRoutes";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
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

  const unfundedTips = tipGroup?.tips.filter(
    (tip) => tip.status === "UNFUNDED"
  );
  const fundedProgress =
    tipGroup && unfundedTips
      ? (1 - unfundedTips?.length / tipGroup?.tips.length) * 100
      : 0;
  const firstUnfundedTipId = unfundedTips?.[0]?.id;

  React.useEffect(() => {
    if (firstUnfundedTipId) {
      (async () => {
        const result = await fetch(
          `${ApiRoutes.tipGroups}/${id}/tips/${firstUnfundedTipId}/prepare`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        // TODO: if result is ok, mutate the current tip group for faster processing
        if (!result.ok) {
          console.error(
            "Failed to prepare group tip",
            firstUnfundedTipId,
            result.statusText
          );
        }
      })();
    }
  }, [firstUnfundedTipId, id]);

  // const hasExpired = tipGroup && hasTipExpired(tipGroup.tips[0]); // FIXME: individual tips could have different expiry

  if (tipGroup) {
    if (tipGroup.status === "FUNDED" && fundedProgress < 100) {
      return (
        <>
          <Text>Preparing tips...</Text>
          <Progress value={fundedProgress} />
          <Text size="small">Please stay on this page</Text>
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
        <>
          <NextLink
            href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
            passHref
          >
            <a>
              <Button>Bulk Edit</Button>
            </a>
          </NextLink>
          <Spacer />
        </>
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
