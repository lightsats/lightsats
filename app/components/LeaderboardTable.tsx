import {
  Badge,
  Button,
  Card,
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Table,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { Leaderboard } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { TwitterButton } from "components/TwitterButton";
import { format } from "date-fns";
import { useLeaderboardContents } from "hooks/useLeaderboardContents";
import { useUserRoles } from "hooks/useUserRoles";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { formatAmount, getAvatarUrl } from "lib/utils";
import React from "react";
import { useInViewport } from "react-in-viewport";
import useSWR from "swr";
import { LeaderboardEntry } from "types/LeaderboardEntry";

type LeaderboardTableProps = {
  leaderboardId?: string;
};

export function LeaderboardTable({ leaderboardId }: LeaderboardTableProps) {
  const { data: leaderboardContents } = useLeaderboardContents(leaderboardId);
  const paginationRef = React.useRef<HTMLDivElement>(null);
  const { inViewport } = useInViewport(
    paginationRef,
    { rootMargin: "500px 0px" },
    { disconnectOnLeave: false }
  );
  const [perPage, setPerPage] = React.useState(10);
  const { data: leaderboards } = useSWR<Leaderboard[]>(
    `/api/leaderboards`,
    defaultFetcher
  );

  React.useEffect(() => {
    if (inViewport) {
      setPerPage(perPage + 10);
    }
  }, [inViewport, perPage]);

  const { data: userRoles } = useUserRoles();

  // TODO: add serverside paging
  const visibleScoreboardEntries = React.useMemo(
    () => leaderboardContents?.entries.slice(0, perPage),
    [perPage, leaderboardContents?.entries]
  );
  if (!leaderboardContents || !visibleScoreboardEntries) {
    return <Loading color="currentColor" size="lg" />;
  }

  return (
    <>
      <Text h2>Leaderboard</Text>
      <Text size="small">Updates every 15 seconds</Text>
      <Spacer />

      <Grid.Container gap={1} css={{ width: "100%", margin: 0, padding: 0 }}>
        <Grid xs={4}>
          <Card css={{ dropShadow: "$xs" }}>
            <Card.Header>
              <Col>
                <Text size={12} weight="bold" transform="uppercase">
                  # Total tips sent
                </Text>
                <Text h3>{leaderboardContents.numTipsSent}</Text>
              </Col>
            </Card.Header>
          </Card>
        </Grid>
        <Grid xs={4}>
          <Card css={{ dropShadow: "$xs" }}>
            <Card.Header>
              <Col>
                <Text size={12} weight="bold" transform="uppercase">
                  # 🍊💊 people
                </Text>
                <Text h3>{leaderboardContents.numUsersOnboarded}</Text>
              </Col>
            </Card.Header>
          </Card>
        </Grid>
        <Grid xs={4}>
          <Card css={{ dropShadow: "$xs" }}>
            <Card.Header>
              <Col>
                <Text size={12} weight="bold">
                  TOTAL TIP VALUE (sats)
                </Text>
                <Text h3 css={{ whiteSpace: "nowrap" }}>
                  {formatAmount(leaderboardContents.totalSatsSent, 1)}
                </Text>
              </Col>
            </Card.Header>
          </Card>
        </Grid>
      </Grid.Container>
      <Spacer />
      {(leaderboards?.length ||
        userRoles?.some((role) => role.roleType === "SUPERADMIN")) && (
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
      )}

      <Grid.Container
        gap={1}
        justify="center"
        xs={12}
        sm={0}
        css={{ padding: 0 }}
      >
        {visibleScoreboardEntries.map((scoreboardEntry, i) => {
          return (
            <Grid key={i} xs={12}>
              <Card css={{ dropShadow: "$sm" }}>
                <Card.Body>
                  <Row align="center" justify="space-between">
                    <Badge
                      css={{
                        background:
                          i === 0
                            ? "$gold"
                            : i === 1
                            ? "$silver"
                            : i === 2
                            ? "$bronze"
                            : "$gray700",
                      }}
                    >
                      {i + 1}
                    </Badge>
                    <Col>
                      <LeaderboardUser leaderboardEntry={scoreboardEntry} />
                    </Col>
                    <Col>
                      {scoreboardEntry.twitterUsername && (
                        <TwitterButton
                          username={scoreboardEntry.twitterUsername}
                        />
                      )}
                    </Col>
                    <Col css={{ textAlign: "right" }}>
                      <Row>
                        <Badge variant="flat" color="primary">
                          {formatAmount(scoreboardEntry.satsSent)}⚡
                        </Badge>
                        <Spacer x={0.5} />
                        <Badge variant="flat" color="primary">
                          {scoreboardEntry.achievementTypes.length}🏆
                        </Badge>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer />
      <Grid.Container xs={0} sm={12} css={{ padding: 0, width: "100%", fg: 1 }}>
        <Grid css={{ width: "100%" }}>
          <Table
            fixed
            css={{
              zIndex: 10,
              height: "auto",
              minWidth: "100%",
            }}
            containerCss={{
              background: "$white",
              dropShadow: "none",
            }}
          >
            <Table.Header>
              <Table.Column width={1} align="center">
                #
              </Table.Column>
              <Table.Column css={{ pl: 20 }}>Tipper</Table.Column>
              <Table.Column css={{ textAlign: "center" }}>
                Tips sent
              </Table.Column>
              <Table.Column css={{ textAlign: "center" }}>
                Success rate
              </Table.Column>
              <Table.Column css={{ textAlign: "center" }}>
                Tipped sats
              </Table.Column>
              <Table.Column css={{ textAlign: "center" }}>
                Achievements
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {visibleScoreboardEntries.map((scoreboardEntry, i) => {
                return (
                  <Table.Row key={i}>
                    <Table.Cell>
                      <Badge
                        css={{
                          background:
                            i === 0
                              ? "$gold"
                              : i === 1
                              ? "$silver"
                              : i === 2
                              ? "$bronze"
                              : "$gray700",
                        }}
                      >
                        {i + 1}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Row align="center">
                        <LeaderboardUser leaderboardEntry={scoreboardEntry} />
                        {scoreboardEntry.twitterUsername && (
                          <TwitterButton
                            username={scoreboardEntry.twitterUsername}
                          />
                        )}
                      </Row>
                    </Table.Cell>
                    <Table.Cell css={{ textAlign: "center" }}>
                      {scoreboardEntry.numTipsSent}
                    </Table.Cell>
                    <Table.Cell css={{ textAlign: "center" }}>
                      {(scoreboardEntry.successRate * 100).toFixed(0)}%
                    </Table.Cell>
                    <Table.Cell css={{ textAlign: "center" }}>
                      <Badge variant="flat" color="primary">
                        {formatAmount(scoreboardEntry.satsSent)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell css={{ textAlign: "center" }}>
                      <Badge variant="flat" color="secondary">
                        {formatAmount(scoreboardEntry.achievementTypes.length)}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Grid>
      </Grid.Container>
      <div ref={paginationRef} />
    </>
  );
}

type LeaderboardUserProps = {
  leaderboardEntry: LeaderboardEntry;
};
function LeaderboardUser({
  leaderboardEntry: scoreboardEntry,
}: LeaderboardUserProps) {
  return (
    <NextLink href={`${PageRoutes.users}/${scoreboardEntry.userId}`} passHref>
      <a style={{ display: "flex" }}>
        <NextUIUser
          name={scoreboardEntry.name ?? DEFAULT_NAME}
          src={getAvatarUrl(
            scoreboardEntry.avatarURL,
            scoreboardEntry.fallbackAvatarId
          )}
        />
      </a>
    </NextLink>
  );
}
