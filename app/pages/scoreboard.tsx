import {
  Badge,
  Card,
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { TwitterButton } from "components/TwitterButton";
import { DEFAULT_NAME } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import useSWR from "swr";
import { Scoreboard as ScoreboardType } from "types/Scoreboard";
import { ScoreboardEntry } from "types/ScoreboardEntry";

const Scoreboard: NextPage = () => {
  const { data: scoreboard } = useSWR<ScoreboardType>(
    `/api/scoreboard`,
    defaultFetcher
  );
  if (!scoreboard) {
    return <Loading type="spinner" color="currentColor" size="lg" />;
  }

  return (
    <>
      <Text h2>Scoreboard</Text>
      <Grid.Container gap={1} css={{ mx: 0, width: "100%" }}>
        <Grid xs={4}>
          <Card>
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
          <Card>
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
          <Card>
            <Card.Header>
              <Col>
                <Text size={12} weight="bold" transform="uppercase">
                  Total tip value
                </Text>
                <Text h3>{scoreboard.totalSatsSent.toFixed()} sats</Text>
              </Col>
            </Card.Header>
          </Card>
        </Grid>
      </Grid.Container>
      <Spacer />
      {/* mobile view */}
      <Grid.Container
        gap={2}
        justify="center"
        xs={12}
        sm={0}
        style={{ padding: 0 }}
      >
        {scoreboard.entries.map((scoreboardEntry, i) => {
          return (
            <Grid
              key={i}
              justify="center"
              css={{
                width: "100%",
                px: 0,
              }}
            >
              <Card
                variant="flat"
                css={{
                  backgroundColor:
                    i === 0
                      ? "$gold"
                      : i === 1
                      ? "$silver"
                      : i === 2
                      ? "$bronze"
                      : "$accents0",
                }}
              >
                <Card.Body>
                  <Row align="center" justify="space-between">
                    <Text size={22} b>
                      #{i + 1}
                    </Text>
                    <ScoreboardUser scoreboardEntry={scoreboardEntry} />
                    {scoreboardEntry.twitterUsername && (
                      <TwitterButton
                        username={scoreboardEntry.twitterUsername}
                      />
                    )}
                    <Text b size="$xl">
                      {scoreboardEntry.satsSent} sats
                    </Text>
                  </Row>
                  <Spacer />
                  <Row justify="center">
                    <Badge>{scoreboardEntry.numTipsSent} tips🧡</Badge>
                    <Spacer x={0.5} />
                    <Badge
                      style={{
                        background: `rgba(${Math.floor(
                          (1 - scoreboardEntry.successRate) * 220
                        )},${Math.floor(
                          scoreboardEntry.successRate * 220
                        )},0, 1)`,
                      }}
                    >
                      {Math.round(scoreboardEntry.successRate * 100)}% success
                      rate
                    </Badge>
                  </Row>
                </Card.Body>
              </Card>
            </Grid>
          );
        })}
      </Grid.Container>

      <Spacer />
      {/* desktop view */}
      <Grid.Container justify="center" xs={0} sm={12}>
        <Grid xs={12} justify="center">
          <Row
            justify="space-between"
            align="center"
            css={{ paddingBottom: "0.5em", fontWeight: "$bold" }}
          >
            <Row justify="center" align="center">
              #
            </Row>
            <Row justify="flex-start" align="center">
              Tipper
            </Row>
            <Row justify="center" align="center">
              Tipped sats
            </Row>
            <Row justify="center" align="center">
              # of tips
            </Row>
            <Row justify="center" align="center">
              Success rate
            </Row>
          </Row>
        </Grid>
        {scoreboard.entries.map((scoreboardEntry, i) => {
          return (
            <Grid xs={12} key={i} justify="center" style={{ padding: 0 }}>
              <Row
                justify="space-between"
                align="center"
                css={{
                  backgroundColor:
                    i === 0
                      ? "$gold"
                      : i === 1
                      ? "$silver"
                      : i === 2
                      ? "$bronze"
                      : i % 2 === 0
                      ? "$accents0"
                      : "$accents1",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  marginBottom: i === 2 ? 20 : 0,
                }}
              >
                <Row justify="center" align="center">
                  <Badge
                    css={{
                      background:
                        i === 0
                          ? "$gold"
                          : i === 1
                          ? "$silver"
                          : i === 2
                          ? "$bronze"
                          : "$gray800",
                    }}
                  >
                    #{i + 1}
                  </Badge>
                </Row>
                <Row justify="flex-start" align="center">
                  <ScoreboardUser scoreboardEntry={scoreboardEntry} />

                  {scoreboardEntry.twitterUsername && (
                    <TwitterButton username={scoreboardEntry.twitterUsername} />
                  )}
                </Row>
                <Row justify="center" align="center">
                  {scoreboardEntry.satsSent}
                </Row>
                <Row justify="center" align="center">
                  {scoreboardEntry.numTipsSent}
                </Row>
                <Row justify="center" align="center">
                  {(scoreboardEntry.successRate * 100).toFixed(2)}%
                </Row>
              </Row>
            </Grid>
          );
        })}
      </Grid.Container>
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
