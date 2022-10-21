import {
  Badge,
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
      <Text h2>Tipping Scoreboard</Text>
      <Row justify="center" align="center">
        <Badge color="success">
          {scoreboard.numUsersOnboarded} plebs onboarded
        </Badge>
        <Spacer />
        <Badge color="success">{scoreboard.totalSatsSent} sats sent⚡</Badge>
      </Row>
      <Spacer />
      <Grid.Container gap={2} justify="center">
        <Grid xs={12} justify="center">
          <Row justify="space-between" align="center">
            <Row justify="center" align="center">
              <Badge>Placing</Badge>
            </Row>
            <Row justify="center" align="center">
              <Badge>Tipper</Badge>
            </Row>
            <Row justify="center" align="center">
              <Badge>Sats Donated</Badge>
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
                <Row justify="center" align="center">
                  <NextUIUser
                    name={scoreboardEntry.name ?? "anon"}
                    src={scoreboardEntry.avatarURL}
                  />
                </Row>
                <Row justify="center" align="center">
                  <Badge color="success">{scoreboardEntry.satsSent}⚡</Badge>
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
