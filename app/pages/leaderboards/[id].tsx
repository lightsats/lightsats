import { Loading, Spacer } from "@nextui-org/react";
import { LeaderboardTable } from "components/LeaderboardTable";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";

const LeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const leaderboardId = id as string;

  const { data: leaderboard } = useSWR(
    `/api/${PageRoutes.leaderboards}/${id}`,
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
  return <LeaderboardTable leaderboardId={leaderboardId} />;
};

export default LeaderboardPage;

export { getStaticProps, getStaticPaths };
