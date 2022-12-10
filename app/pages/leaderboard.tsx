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
import { useUserRoles } from "hooks/useUserRoles";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { formatAmount, getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import React from "react";
import { useInViewport } from "react-in-viewport";
import useSWR, { SWRConfiguration } from "swr";
import { Scoreboard as ScoreboardType } from "types/Scoreboard";
import { ScoreboardEntry } from "types/ScoreboardEntry";

const pollScoreboardConfig: SWRConfiguration = { refreshInterval: 15000 };

const Scoreboard: NextPage = () => {
  const { data: scoreboard } = useSWR<ScoreboardType>(
    `/api/scoreboard`,
    defaultFetcher,
    pollScoreboardConfig
  );
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
    () => scoreboard?.entries.slice(0, perPage),
    [perPage, scoreboard?.entries]
  );
  if (!scoreboard || !visibleScoreboardEntries) {
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
                <Text h3>{scoreboard.numTipsSent}</Text>
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
                <Text h3>{scoreboard.numUsersOnboarded}</Text>
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
                  {formatAmount(scoreboard.totalSatsSent, 1)}
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
                      href={`${Routes.leaderboards}/${leaderboard.id}`}
                      key={leaderboard.id}
                    >
                      <Grid as="a">
                        <Card css={{ minWidth: "300px" }}>
                          <Card.Body>
                            <Text b>{leaderboard.title}</Text>
                          </Card.Body>
                        </Card>
                      </Grid>
                    </NextLink>
                  ))}
                </Grid.Container>
              )}

              {userRoles?.some((role) => role.roleType === "SUPERADMIN") && (
                <>
                  <Spacer />
                  <Row justify="center">
                    {" "}
                    <NextLink href={Routes.newLeaderboard}>
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
                      <ScoreboardUser scoreboardEntry={scoreboardEntry} />
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
                        <ScoreboardUser scoreboardEntry={scoreboardEntry} />
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
};

export default Scoreboard;

type ScoreboardUserProps = {
  scoreboardEntry: ScoreboardEntry;
};
function ScoreboardUser({ scoreboardEntry }: ScoreboardUserProps) {
  return (
    <NextLink href={`${Routes.users}/${scoreboardEntry.userId}`} passHref>
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
