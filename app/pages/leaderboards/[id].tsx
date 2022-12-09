import { Loading, Spacer, Text } from "@nextui-org/react";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";

const LeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: leaderboard } = useSWR(
    `/api/${Routes.leaderboards}/${id}`,
    defaultFetcher
  );

  if (!leaderboard) {
    return (
      <>
        <Spacer y={4} />
        <Loading color="currentColor" size="lg">
          Loading...
        </Loading>
      </>
    );
  }
  return <Text>TODO!</Text>;
};

export default LeaderboardPage;

export { getStaticProps, getStaticPaths };
