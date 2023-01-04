import { Loading, Spacer } from "@nextui-org/react";
import { Leaderboard, LeaderboardTheme } from "@prisma/client";
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

  const { data: leaderboard } = useSWR<Leaderboard>(
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
        creatorId={leaderboard.creatorId}
        startDate={new Date(leaderboard.start)}
        endDate={leaderboard.end ? new Date(leaderboard.end) : undefined}
        isGlobal={leaderboard.global}
      />
      <LeaderboardBackground theme={leaderboard.theme ?? undefined} />
      <LeaderboardBackgroundTop theme={leaderboard.theme ?? undefined} />
      <LeaderboardBackgroundBottom theme={leaderboard.theme ?? undefined} />
    </>
  );
};

export default CustomLeaderboardPage;

export { getStaticProps, getStaticPaths };

type LeaderboardBackgroundProps = {
  theme: LeaderboardTheme | undefined;
};
type LeaderboardBackgroundVariantProps = {
  variant?: "card" | "page";
};

export function LeaderboardBackground({ theme }: LeaderboardBackgroundProps) {
  if (!theme) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: `url(/leaderboards/${theme.toLowerCase()}/background.png)`,
        backgroundSize: "25%",
        backgroundRepeat: "repeat",
        opacity: 0.05,
        zIndex: -1,
      }}
    />
  );
}

type LeaderboardBackgroundTopProps = LeaderboardBackgroundProps &
  LeaderboardBackgroundVariantProps;

export function LeaderboardBackgroundTop({
  variant = "page",
  theme,
}: LeaderboardBackgroundTopProps) {
  if (!theme) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        top: variant === "card" ? "-10%" : "76px",
        left: 0,
        width: variant === "card" ? "200%" : "100vw",
        height: variant === "card" ? "300%" : "min(50vw, calc(100vh - 76px))",
        background: `url(/leaderboards/${theme.toLowerCase()}/bg-top.png)`,
        backgroundSize: "contain",
        backgroundPositionX: "140%",
        opacity: 0.5,
        zIndex: -1,
      }}
    />
  );
}

type LeaderboardBackgroundBottomProps = LeaderboardBackgroundProps &
  LeaderboardBackgroundVariantProps;

export function LeaderboardBackgroundBottom({
  variant = "page",
  theme,
}: LeaderboardBackgroundBottomProps) {
  if (!theme) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: variant === "card" ? "100%" : "100vw",
        height: variant === "card" ? "100%" : "50vw",
        background: `url(/leaderboards/${theme.toLowerCase()}/bg-bottom.png)`,
        backgroundSize: "contain",
        opacity: 0.5,
        zIndex: -1,
      }}
    />
  );
}
