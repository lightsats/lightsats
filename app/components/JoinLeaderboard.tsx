import { Button, Col, Loading, Row, Spacer, Text } from "@nextui-org/react";
import React from "react";

type JoinLeaderboardCardProps = {
  leaderboardId: string;
};
export function JoinLeaderboard({ leaderboardId }: JoinLeaderboardCardProps) {
  const [isJoining, setJoining] = React.useState(false);
  const joinLeaderboard = React.useCallback(() => {
    setJoining(true);
    (async () => {
      alert("Coming soon: Join " + leaderboardId);
    })();
    setJoining(false);
  }, [leaderboardId]);
  return (
    <Col>
      <Row justify="center">
        <Text b>{"Don't miss out on the fun!"}</Text>
      </Row>
      <Spacer />
      <Row justify="center">
        <Button auto onClick={joinLeaderboard} disabled={isJoining}>
          {isJoining ? (
            <Loading color="currentColor" size="sm" />
          ) : (
            "Join Leaderboard 🚀"
          )}
        </Button>
      </Row>
    </Col>
  );
}
