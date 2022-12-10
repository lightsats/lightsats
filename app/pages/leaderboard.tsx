import { LeaderboardTable } from "components/LeaderboardTable";
import type { NextPage } from "next";

const LeaderboardPage: NextPage = () => {
  return (
    <>
      <LeaderboardTable title={"Leaderboard"} />
    </>
  );
};

export default LeaderboardPage;
