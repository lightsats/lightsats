import { Button, Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Leaderboard } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { format } from "date-fns";
import { useUserRoles } from "hooks/useUserRoles";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import {
  LeaderboardBackground,
  LeaderboardBackgroundBottom,
  LeaderboardBackgroundTop,
} from "pages/leaderboards/[id]";
import useSWR from "swr";

type LeaderboardsGridProps = {
  featured?: boolean;
};

export function LeaderboardsGrid({ featured }: LeaderboardsGridProps) {
  const { data: leaderboards } = useSWR<Leaderboard[]>(
    `/api/leaderboards`,
    defaultFetcher
  );
  const { data: userRoles } = useUserRoles();

  return leaderboards?.length ||
    userRoles?.some((role) => role.roleType === "SUPERADMIN") ? (
    <>
      <Spacer />
      <Row align="center">
        <Text b>
          {featured ? <>⭐ Featured Leaderboards</> : <>⭐ All Leaderboards</>}
        </Text>
        {featured ? (
          <>
            <Spacer x={0.5} />
            <NextLink href={PageRoutes.leaderboards}>
              <a>
                <Button size="sm" flat auto>
                  See All
                </Button>
              </a>
            </NextLink>
          </>
        ) : (
          <>
            <Spacer x={0.5} />
            <NextLink href={PageRoutes.leaderboard}>
              <a>
                <Button size="sm" flat auto>
                  Global Leaderboard
                </Button>
              </a>
            </NextLink>
          </>
        )}
        {userRoles?.some((role) => role.roleType === "SUPERADMIN") && (
          <>
            <Spacer x={0.5} />
            <NextLink href={PageRoutes.newLeaderboard}>
              <a>
                <Button size="sm" flat auto color="primary">
                  Create Leaderboard
                </Button>
              </a>
            </NextLink>
          </>
        )}
      </Row>
      <Spacer y={0.5} />
      {leaderboards && (
        <Grid.Container gap={1}>
          {leaderboards
            .slice(0, featured ? 3 : undefined)
            .map((leaderboard) => (
              <NextLink
                href={`${PageRoutes.leaderboards}/${leaderboard.id}`}
                key={leaderboard.id}
                passHref
              >
                <a>
                  <Grid>
                    <Card
                      css={{ minWidth: "min(400px, 80vw)", dropShadow: "$sm" }}
                      isHoverable
                      isPressable
                    >
                      <LeaderboardBackground />
                      <LeaderboardBackgroundTop variant="card" />
                      <LeaderboardBackgroundBottom variant="card" />
                      <Card.Body>
                        <Row>
                          <Text b>{leaderboard.title}</Text>
                        </Row>
                        <Spacer />
                        <Row justify="space-between">
                          <Text size="small" color="$gray700">
                            {format(new Date(leaderboard.start), "d MMMM yyyy")}{" "}
                            -{" "}
                            {leaderboard.end
                              ? format(new Date(leaderboard.end), "d MMMM yyyy")
                              : "∞"}
                          </Text>
                          {leaderboard.end &&
                            new Date(leaderboard.end).getTime() <
                              Date.now() && (
                              <Text size="small" color="$gray700">
                                Ended
                              </Text>
                            )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Grid>
                </a>
              </NextLink>
            ))}
        </Grid.Container>
      )}
      <Spacer />
    </>
  ) : null;
}
