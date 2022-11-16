import {
  Badge,
  Card,
  Col,
  Container,
  Grid,
  Loading,
  Row,
  Spacer,
  Table,
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
    return <Loading color="currentColor" size="lg" />;
  }

  return (
    <>
      <Text h2>Leaderboard</Text>
      <Grid.Container gap={1} css={{ width: "100%", margin: 0, padding: 0 }}>
        <Grid xs={4}>
          <Card css={{ dropShadow: "$xs" }}>
            <Card.Header>
              <Col>
                <Text size={12} weight="bold" transform="uppercase">
                  # Total tips sent
                </Text>
                <Text h4>{scoreboard.numTipsSent}</Text>
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
                <Text size={12} weight="bold" transform="uppercase">
                  Total tip value (sats)
                </Text>
                <Text h3>{(scoreboard.totalSatsSent / 1000).toFixed()}k</Text>
              </Col>
            </Card.Header>
          </Card>
        </Grid>
      </Grid.Container>

      <Spacer />
      <Grid.Container
        gap={1}
        justify="center"
        xs={12}
        sm={0}
        css={{ padding: 0 }}
      >
        {scoreboard.entries.map((scoreboardEntry, i) => {
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
                            : "$gray600",
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
                      <Badge variant="flat" color="primary">
                        {(scoreboardEntry.satsSent / 1000).toFixed(0)}
                        {scoreboardEntry.satsSent / 1000 > 0 && "k"}
                      </Badge>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Grid>
          );
        })}
      </Grid.Container>
      <Spacer />
      <Container xs={false} lg css={{ padding: 0 }}>
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
            <Table.Column css={{ textAlign: "center" }}>Tips sent</Table.Column>
            <Table.Column css={{ textAlign: "center" }}>
              Success rate
            </Table.Column>
            <Table.Column css={{ textAlign: "center" }}>
              Tipped sats
            </Table.Column>
          </Table.Header>
          <Table.Body>
            {scoreboard.entries.map((scoreboardEntry, i) => {
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
                            : "$gray600",
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
                    {scoreboardEntry.successRate} %
                  </Table.Cell>
                  <Table.Cell css={{ textAlign: "center" }}>
                    <Badge variant="flat" color="primary">
                      {(scoreboardEntry.satsSent / 1000).toFixed(0)}
                      {scoreboardEntry.satsSent / 1000 > 0 && "k"}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Container>
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
