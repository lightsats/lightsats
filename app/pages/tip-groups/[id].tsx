import { Grid, Loading, Spacer, Text } from "@nextui-org/react";
import { SentTipCard } from "components/tipper/SentTipCard";
import { ApiRoutes } from "lib/ApiRoutes";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const TipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: tipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher
  );

  // const hasExpired = tipGroup && hasTipExpired(tipGroup.tips[0]); // FIXME: individual tips could have different expiry

  if (tipGroup) {
    return (
      <>
        <Text h1>Tip Group</Text>

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
