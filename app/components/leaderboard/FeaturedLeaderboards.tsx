import { Button, Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Leaderboard } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { format } from "date-fns";
import { useUserRoles } from "hooks/useUserRoles";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
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
            <Grid.Container>
              {leaderboards.map((leaderboard) => (
                <NextLink
                  href={`${PageRoutes.leaderboards}/${leaderboard.id}`}
                  key={leaderboard.id}
                  passHref
                >
                  <a>
                    <Grid>
                      <Card css={{ minWidth: "300px" }}>
                        <Card.Body>
                          <Row>
                            <Text b>{leaderboard.title}</Text>
                          </Row>
                          <Row>
                            <Text>
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
                                : "∞"}
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
