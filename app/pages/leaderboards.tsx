import { LeaderboardsGrid } from "components/leaderboard/LeaderboardsGrid";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const LeaderboardsPage: NextPage = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Leaderboards</title>
      </Head>

      <LeaderboardsGrid
        showAll
        userId={router.query.userId as string | undefined}
      />
    </>
  );
};

export default LeaderboardsPage;
