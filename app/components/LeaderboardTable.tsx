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
} from "@nextui-org/react";
import { LeaderboardTheme } from "@prisma/client";
import { Alert } from "components/Alert";
import { JoinLeaderboard } from "components/JoinLeaderboard";
import { LeaderboardsGrid } from "components/leaderboard/LeaderboardsGrid";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { NextUIUser } from "components/NextUIUser";
import { TwitterButton } from "components/TwitterButton";
import { format, formatDistance } from "date-fns";
import { useLeaderboardContents } from "hooks/useLeaderboardContents";
import { useLeaderboardUsers } from "hooks/useLeaderboardUsers";
import { usePublicUser } from "hooks/usePublicUser";
import { DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { formatAmount, getAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import React from "react";
import Countdown from "react-countdown";
import { useInViewport } from "react-in-viewport";
import { LeaderboardEntry } from "types/LeaderboardEntry";

type LeaderboardTableProps = {
  leaderboardId?: string;
  title: string;
  canEdit?: boolean;
  creatorId?: string;
  startDate?: Date;
  endDate?: Date;
  theme?: LeaderboardTheme;
};

export function LeaderboardTable({
  leaderboardId,
  title,
  canEdit,
  creatorId,
  startDate,
  endDate,
  theme,
}: LeaderboardTableProps) {
  const { data: leaderboardContents } = useLeaderboardContents(leaderboardId);
  const paginationRef = React.useRef<HTMLDivElement>(null);
  const { inViewport } = useInViewport(
    paginationRef,
    { rootMargin: "500px 0px" },
    { disconnectOnLeave: false }
  );
  const [perPage, setPerPage] = React.useState(10);
  const { data: session } = useSession();

  const { data: creator } = usePublicUser(creatorId, true);

  const numEntries = leaderboardContents?.entries.length ?? 0;

  const { data: leaderboardUsers } = useLeaderboardUsers(leaderboardId);

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

  const hasStarted = !startDate || startDate.getTime() < Date.now();
  const hasEnded = endDate && endDate.getTime() < Date.now();

  return (
    <>
      <Text h2>{title}</Text>
      {creator && (
        <>
          {startDate && (
            <>
              <Text size="small" color="$gray700">
                {format(new Date(startDate), "d MMMM yyyy")} -{" "}
                {endDate ? format(new Date(endDate), "d MMMM yyyy") : "∞"}
              </Text>
            </>
          )}
          <Spacer />
          <Row justify="center" align="center">
            <Text>Created by</Text>
            <Spacer x={0.25} />
            <LeaderboardUser
              user={{
                userId: creator.id,
                name: creator.name ?? undefined,
                avatarURL: creator.avatarURL ?? undefined,
                fallbackAvatarId: creator.fallbackAvatarId,
              }}
              theme={theme}
            />
          </Row>
          <Spacer />
        </>
      )}
      {hasEnded && (
        <>
          <Alert>
            This leaderboard ended{" "}
            {formatDistance(new Date(), new Date(endDate))} ago
          </Alert>
          <Spacer />
        </>
      )}
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
      {session && !hasEnded && leaderboardId && leaderboardUsers && (
        <>
          <Card css={{}}>
            <Card.Body>
              <Row>
                <Col css={{ position: "absolute" }}>
                  <Text h3>{leaderboardUsers.length}</Text>
                  <Text>participants</Text>
                </Col>
                {!leaderboardUsers.some(
                  (user) => user.userId === session.user.id
                ) && (
                  <>
                    <Spacer />
                    <JoinLeaderboard leaderboardId={leaderboardId} />
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
          <Spacer />
        </>
      )}

      {hasStarted && (
        <>
          <Grid.Container
            gap={1}
            css={{ width: "100%", margin: 0, padding: 0 }}
          >
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
        </>
      )}
      {!leaderboardId && <LeaderboardsGrid featured />}

      {hasStarted ? (
        <>
          {leaderboardContents.entries.length ? (
            <>
              <LeaderboardTableContents
                visibleScoreboardEntries={visibleScoreboardEntries}
                theme={theme}
              />
              <div ref={paginationRef} />
            </>
          ) : (
            <>
              <Text blockquote>
                {
                  "This leaderboard is empty. Send a successful tip to appear here."
                }
              </Text>
            </>
          )}
        </>
      ) : (
        <>
          <Spacer y={2} />
          <Text h4>STARTS IN</Text>
          <Text h1>
            <Countdown date={startDate} />
          </Text>
        </>
      )}
    </>
  );
}
type LeaderboardTableContentsProps = {
  visibleScoreboardEntries: LeaderboardEntry[];
  theme: LeaderboardTheme | undefined;
};

function LeaderboardTableContents({
  visibleScoreboardEntries,
  theme,
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
                      <LeaderboardUser theme={theme} user={scoreboardEntry} />
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
                    <Table.Cell css={{ overflow: "visible" }}>
                      <Row align="center">
                        <LeaderboardUser theme={theme} user={scoreboardEntry} />
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
  user: {
    userId: string;
    name: string | undefined;
    avatarURL: string | undefined;
    fallbackAvatarId: string | undefined;
  };
  theme: LeaderboardTheme | undefined;
};
function LeaderboardUser({ user, theme }: LeaderboardUserProps) {
  return (
    <NextLink href={`${PageRoutes.users}/${user.userId}`} passHref>
      <a style={{ display: "flex", position: "relative", overflow: "visible" }}>
        {theme && (
          <div
            style={{ position: "absolute", top: -21, left: 1, zIndex: 10000 }}
          >
            <NextImage
              src={`/leaderboards/${theme}/hat.png`}
              width={60}
              height={60}
            />
          </div>
        )}
        <NextUIUser
          name={user.name ?? DEFAULT_NAME}
          src={getAvatarUrl(user.avatarURL, user.fallbackAvatarId)}
        />
      </a>
    </NextLink>
  );
}
