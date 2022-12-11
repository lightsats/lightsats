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

export function FeaturedLeaderboards() {
  const { data: leaderboards } = useSWR<Leaderboard[]>(
    `/api/leaderboards`,
    defaultFetcher
  );
  const { data: userRoles } = useUserRoles();

  return leaderboards?.length ||
    userRoles?.some((role) => role.roleType === "SUPERADMIN") ? (
    <>
      <Card variant="bordered">
        <Card.Body>
          <Row>
            <Text b>Featured Leaderboards</Text>
          </Row>
          <Spacer />
          {leaderboards && (
            <Grid.Container gap={1}>
              {leaderboards.map((leaderboard) => (
                <NextLink
                  href={`${PageRoutes.leaderboards}/${leaderboard.id}`}
                  key={leaderboard.id}
                  passHref
                >
                  <a>
                    <Grid>
                      <Card css={{ minWidth: "min(400px, 80vw)" }}>
                        <LeaderboardBackground />
                        <LeaderboardBackgroundTop variant="card" />
                        <LeaderboardBackgroundBottom variant="card" />
                        <Card.Body>
                          <Row>
                            <Text b>{leaderboard.title}</Text>
                          </Row>
                          <Spacer />
                          <Row>
                            <Text size="small">
                              {format(
                                new Date(leaderboard.start),
                                "d MMMM yyyy"
                              )}{" "}
                              -{" "}
                              {leaderboard.end
                                ? format(
                                    new Date(leaderboard.end),
                                    "d MMMM yyyy"
                                  )
                                : ""}
                            </Text>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Grid>
                  </a>
                </NextLink>
              ))}
            </Grid.Container>
          )}

          {userRoles?.some((role) => role.roleType === "SUPERADMIN") && (
            <>
              <Spacer />
              <Row justify="center">
                {" "}
                <NextLink href={PageRoutes.newLeaderboard}>
                  <a>
                    <Button size="sm">Create Leaderboard</Button>
                  </a>
                </NextLink>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
      <Spacer />
    </>
  ) : null;
}
