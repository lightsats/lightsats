import { LeaderboardTable } from "components/LeaderboardTable";
import type { NextPage } from "next";
import Head from "next/head";

const LeaderboardPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Leaderboard</title>
      </Head>
      <LeaderboardTable title={"Leaderboard"} />
    </>
  );
};

export default LeaderboardPage;
