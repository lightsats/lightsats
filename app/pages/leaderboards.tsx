import { LeaderboardsGrid } from "components/leaderboard/LeaderboardsGrid";
import type { NextPage } from "next";
import Head from "next/head";

const LeaderboardsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Leaderboards</title>
      </Head>
      <LeaderboardsGrid />
    </>
  );
};

export default LeaderboardsPage;
