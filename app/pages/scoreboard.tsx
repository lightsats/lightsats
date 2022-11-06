import {
  Badge,
  Card,
  Col,
  Container,
  Grid,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { defaultFetcher } from "lib/swr";
import { getAvatarUrl } from "lib/utils";
import type { NextPage } from "next";
import Image from "next/image";
import useSWR from "swr";
import { Scoreboard as ScoreboardType } from "types/Scoreboard";

const Scoreboard: NextPage = () => {
  const { data: scoreboard } = useSWR<ScoreboardType>(
    `/api/scoreboard`,
    defaultFetcher
  );
  if (!scoreboard) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <Container gap={22}>
      <Text h2>Scoreboard</Text>

      <Grid.Container gap={2} justify="center">
        <Grid xs={2} sm={3}>
          <Card>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text
                  size={12}
                  weight="bold"
                  transform="uppercase"
                  color="#ffffffAA"
                >
                  Number of tips sent
                </Text>
                <Text h1 color="white">
                  24
                </Text>
              </Col>
            </Card.Header>
            <Card.Image
              src="https://nextui.org/images/card-example-2.jpeg"
              objectFit="cover"
              width="100%"
              height={150}
              alt="Card image background"
            />
          </Card>
        </Grid>
        <Grid xs={2} sm={3}>
          <Card>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text
                  size={12}
                  weight="bold"
                  transform="uppercase"
                  color="#ffffffAA"
                >
                  Number of people onboarded
                </Text>
                <Text h1 color="white">
                  21
                </Text>
              </Col>
            </Card.Header>
            <Card.Image
              src="https://nextui.org/images/card-example-2.jpeg"
              objectFit="cover"
              width="100%"
              height={150}
              alt="Card image background"
            />
          </Card>
        </Grid>
        <Grid xs={2} sm={3}>
          <Card>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text
                  size={12}
                  weight="bold"
                  transform="uppercase"
                  color="#ffffffAA"
                >
                  Average tip value
                </Text>
                <Text h1 color="white">
                  1337 sats
                </Text>
              </Col>
            </Card.Header>
            <Card.Image
              src="https://nextui.org/images/card-example-2.jpeg"
              objectFit="cover"
              width="100%"
              height={150}
              alt="Card image background"
            />
          </Card>
        </Grid>
        <Grid xs={2} sm={3}>
          <Card>
            <Card.Header css={{ position: "absolute", zIndex: 1, top: 5 }}>
              <Col>
                <Text
                  size={12}
                  weight="bold"
                  transform="uppercase"
                  color="#ffffffAA"
                >
                  Number of people onboarded
                </Text>
                <Text h1 color="white">
                  21
                </Text>
              </Col>
            </Card.Header>
            <Card.Image
              src="https://nextui.org/images/card-example-2.jpeg"
              objectFit="cover"
              width="100%"
              height={150}
              alt="Card image background"
            />
          </Card>
        </Grid>
      </Grid.Container>

      {/* <Row justify="center" align="center">
        <Badge color="success">
          {scoreboard.numUsersOnboarded} onboarded🚀
        </Badge>
        <Spacer x={0.5} />
        <Badge color="success">{scoreboard.numTipsSent} tips sent🧡</Badge>
        <Spacer x={0.5} />
        <Badge color="success">{scoreboard.totalSatsSent} sats sent⚡</Badge>
      </Row> */}

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
              style={{
                paddingLeft: 0,
                paddingRight: 0,
              }}
            >
              <Card>
                <Card.Body>
                  <Row align="center">
                    <Badge
                      style={{
                        background:
                          i === 0
                            ? "#AF9500"
                            : i === 1
                            ? "#D7D7D7"
                            : i === 2
                            ? "#6A3805"
                            : "#666",
                      }}
                    >
                      #{i + 1}
                    </Badge>
                    <NextUIUser
                      name={scoreboardEntry.name ?? "anon"}
                      src={getAvatarUrl(
                        scoreboardEntry.avatarURL,
                        scoreboardEntry.fallbackAvatarId
                      )}
                    />
                    {scoreboardEntry.twitterUsername && (
                      <Link
                        href={`https://twitter.com/${scoreboardEntry.twitterUsername}`}
                        target="_blank"
                      >
                        <Image
                          alt="twitter"
                          src="/icons/twitter.svg"
                          width={16}
                          height={16}
                        />
                      </Link>
                    )}
                  </Row>
                  <Spacer />
                  <Row>
                    <Badge color="success">
                      {scoreboardEntry.satsSent} sats⚡
                    </Badge>
                    <Spacer x={0.5} />
                    <Badge color="success">
                      {scoreboardEntry.numTipsSent} tips🧡
                    </Badge>
                    <Spacer x={0.5} />
                    <Badge
                      style={{
                        background: `rgba(${Math.floor(
                          (1 - scoreboardEntry.successRate) * 255
                        )},${Math.floor(
                          scoreboardEntry.successRate * 255
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
          <Row justify="space-between" align="center">
            <Row justify="center" align="center">
              <Badge>Placing</Badge>
            </Row>
            <Row justify="flex-start" align="center">
              <Badge>Tipper</Badge>
            </Row>
            <Row justify="center" align="center">
              <Badge>Sats Donated</Badge>
            </Row>
            <Row justify="center" align="center">
              <Badge>#Tips Sent</Badge>
            </Row>
            <Row justify="center" align="center">
              <Badge>Success Rate</Badge>
            </Row>
          </Row>
        </Grid>
        {scoreboard.entries.map((scoreboardEntry, i) => {
          return (
            <Grid xs={12} key={i} justify="center" style={{ padding: 0 }}>
              <Row
                justify="space-between"
                align="center"
                style={{
                  background: i % 2 === 0 ? "#f5f5f5" : "#fafafa",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                }}
              >
                <Row justify="center" align="center">
                  <Badge
                    style={{
                      background:
                        i === 0
                          ? "#AF9500"
                          : i === 1
                          ? "#D7D7D7"
                          : i === 2
                          ? "#6A3805"
                          : "#666",
                    }}
                  >
                    #{i + 1}
                  </Badge>
                </Row>
                <Row justify="flex-start" align="center">
                  <NextUIUser
                    name={scoreboardEntry.name ?? "anon"}
                    src={getAvatarUrl(
                      scoreboardEntry.avatarURL,
                      scoreboardEntry.fallbackAvatarId
                    )}
                  />
                  {scoreboardEntry.twitterUsername && (
                    <Link
                      href={`https://twitter.com/${scoreboardEntry.twitterUsername}`}
                      target="_blank"
                    >
                      <Image
                        alt="twitter"
                        src="/icons/twitter.svg"
                        width={16}
                        height={16}
                      />
                    </Link>
                  )}
                </Row>
                <Row justify="center" align="center">
                  <Badge color="success">{scoreboardEntry.satsSent}⚡</Badge>
                </Row>
                <Row justify="center" align="center">
                  <Badge color="success">{scoreboardEntry.numTipsSent}🧡</Badge>
                </Row>
                <Row justify="center" align="center">
                  <Badge
                    style={{
                      background: `rgba(${Math.floor(
                        (1 - scoreboardEntry.successRate) * 255
                      )},${Math.floor(
                        scoreboardEntry.successRate * 255
                      )},0, 1)`,
                    }}
                  >
                    {(scoreboardEntry.successRate * 100).toFixed(2)}%
                  </Badge>
                </Row>
              </Row>
            </Grid>
          );
        })}
      </Grid.Container>
    </Container>
  );
};

export default Scoreboard;
