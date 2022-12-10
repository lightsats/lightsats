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
import { FeaturedLeaderboards } from "components/leaderboard/FeaturedLeaderboards";
import { NextLink } from "components/NextLink";
import { TwitterButton } from "components/TwitterButton";
import { useLeaderboardContents } from "hooks/useLeaderboardContents";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { formatAmount, getAvatarUrl } from "lib/utils";
import React from "react";
import { useInViewport } from "react-in-viewport";
import { LeaderboardEntry } from "types/LeaderboardEntry";

type LeaderboardTableProps = {
  leaderboardId?: string;
  title: string;
  canEdit?: boolean;
};

export function LeaderboardTable({
  leaderboardId,
  title,
  canEdit,
}: LeaderboardTableProps) {
  const { data: leaderboardContents } = useLeaderboardContents(leaderboardId);
  const paginationRef = React.useRef<HTMLDivElement>(null);
  const { inViewport } = useInViewport(
    paginationRef,
    { rootMargin: "500px 0px" },
    { disconnectOnLeave: false }
  );
  const [perPage, setPerPage] = React.useState(10);

  const numEntries = leaderboardContents?.entries.length ?? 0;

  React.useEffect(() => {
    if (inViewport && perPage < numEntries) {
      setPerPage(perPage + 10);
    }
  }, [inViewport, perPage, numEntries]);

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
      <Text h2>{title}</Text>
      <Text size="small">Updates every 15 seconds</Text>
      <Spacer />
      {leaderboardId && (
        <>
          <Row justify="center">
            <NextLink href={PageRoutes.leaderboard}>
              <a>
                <Button color="secondary">Back to global leaderboard</Button>
              </a>
            </NextLink>
            {canEdit && (
              <>
                <Spacer />
                <NextLink
                  href={`${PageRoutes.leaderboards}/${leaderboardId}/edit`}
                >
                  <a>
                    <Button auto color="secondary">
                      Edit
                    </Button>
                  </a>
                </NextLink>
              </>
            )}
          </Row>
          <Spacer />
        </>
      )}
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
      {!leaderboardId && <FeaturedLeaderboards />}
      {leaderboardContents.entries.length ? (
        <LeaderboardTableContents
          visibleScoreboardEntries={visibleScoreboardEntries}
        />
      ) : (
        <>
          <Text blockquote>
            {"This leaderboard is empty. Send a successful tip to appear here."}
          </Text>
        </>
      )}
      <div ref={paginationRef} />
    </>
  );
}
type LeaderboardTableContentsProps = {
  visibleScoreboardEntries: LeaderboardEntry[];
};

function LeaderboardTableContents({
  visibleScoreboardEntries,
}: LeaderboardTableContentsProps) {
  return (
    <>
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
