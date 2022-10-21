import {
  Badge,
  Card,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
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
    <>
      <Text h2>Scoreboard</Text>
      <Row justify="center" align="center">
        <Badge color="success">
          {scoreboard.numUsersOnboarded} onboarded🚀
        </Badge>
        <Spacer x={0.5} />
        <Badge color="success">{scoreboard.numTipsSent} tips sent🧡</Badge>
        <Spacer x={0.5} />
        <Badge color="success">{scoreboard.totalSatsSent} sats sent⚡</Badge>
      </Row>
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
                width: "100%",
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
                      src={scoreboardEntry.avatarURL}
                    />
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

      {/* desktop view */}
      <Grid.Container gap={2} justify="center" xs={0} sm={12}>
        <Grid xs={12} justify="center">
          <Row justify="space-between" align="center">
            <Row justify="center" align="center">
              <Badge>#Tips</Badge>
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
                    src={scoreboardEntry.avatarURL}
                  />
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
    </>
  );
};

export default Scoreboard;
