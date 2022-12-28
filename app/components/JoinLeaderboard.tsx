import { Button, Col, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { useLeaderboardContents } from "hooks/useLeaderboardContents";
import { useLeaderboardUsers } from "hooks/useLeaderboardUsers";
import { ApiRoutes } from "lib/ApiRoutes";
import React from "react";
import toast from "react-hot-toast";

type JoinLeaderboardCardProps = {
  leaderboardId: string;
};
export function JoinLeaderboard({ leaderboardId }: JoinLeaderboardCardProps) {
  const [isJoining, setJoining] = React.useState(false);
  const { mutate: mutateLeaderboardUsers } = useLeaderboardUsers(leaderboardId);
  const { mutate: mutateLeaderboardContents } =
    useLeaderboardContents(leaderboardId);
  const joinLeaderboard = React.useCallback(() => {
    setJoining(true);
    (async () => {
      const result = await fetch(
        `${ApiRoutes.leaderboards}/${leaderboardId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!result.ok) {
        toast.error(
          "Failed to join leaderboard: " +
            result.statusText +
            ". Please try again."
        );
      } else {
        toast.success("Joined!");
        mutateLeaderboardUsers();
        mutateLeaderboardContents();
      }
    })();
    setJoining(false);
  }, [leaderboardId, mutateLeaderboardContents, mutateLeaderboardUsers]);
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
