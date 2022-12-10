import { Loading, Spacer } from "@nextui-org/react";
import { LeaderboardTable } from "components/LeaderboardTable";
import { useUserRoles } from "hooks/useUserRoles";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";

const CustomLeaderboardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const leaderboardId = id as string;
  const { data: userRoles } = useUserRoles();

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
  return (
    <>
      <LeaderboardTable
        canEdit={userRoles?.some((role) => role.roleType === "SUPERADMIN")}
        leaderboardId={leaderboardId}
        title={leaderboard.title}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "url(/leaderboards/christmas/background.png)",
          opacity: 0.05,
          zIndex: -1,
        }}
      />
    </>
  );
};

export default CustomLeaderboardPage;

export { getStaticProps, getStaticPaths };
