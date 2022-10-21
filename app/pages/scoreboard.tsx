import {
  Badge,
  Col,
  Grid,
  Loading,
  Row,
  Text,
  User as NextUIUser,
} from "@nextui-org/react";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import useSWR from "swr";
import { ScoreboardEntry } from "types/ScoreboardEntry";

const Scoreboard: NextPage = () => {
  const { data: scoreboardEntries } = useSWR<ScoreboardEntry[]>(
    `/api/scoreboard`,
    defaultFetcher
  );
  if (!scoreboardEntries) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Text h2>Scoreboard</Text>
      <Grid.Container gap={2} justify="center">
        <Grid xs={12} justify="center">
          <Row justify="space-between" align="center">
            <Col>Placing</Col>
            <Col>User</Col>
            <Col>Sats Donated</Col>
            <Col>Success Rate</Col>
          </Row>
        </Grid>
        {scoreboardEntries.map((scoreboardEntry, i) => {
          return (
            <Grid xs={12} key={i} justify="center">
              <Row justify="space-between" align="center">
                <Col>#{i + 1}</Col>
                <Col>
                  <NextUIUser
                    name={scoreboardEntry.name ?? "anon"}
                    src={scoreboardEntry.avatarURL}
                  />
                </Col>
                <Col>
                  <Badge color="success">{scoreboardEntry.satsSent}⚡</Badge>
                </Col>
                <Col>
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
                </Col>
              </Row>
            </Grid>
          );
        })}
      </Grid.Container>
    </>
  );
};

export default Scoreboard;
