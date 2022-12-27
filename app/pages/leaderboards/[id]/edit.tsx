import { Button, Card, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { Leaderboard } from "@prisma/client";
import {
  LeaderboardForm,
  LeaderboardFormData,
  LeaderboardFormSubmitData,
} from "components/LeaderboardForm";
import { format } from "date-fns";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import { UpdateLeaderboardRequest } from "types/LeaderboardRequest";

const EditLeaderboard: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: leaderboard, mutate: mutateLeaderboard } =
    useSWRImmutable<Leaderboard>(
      `/api/${PageRoutes.leaderboards}/${id}`,
      defaultFetcher
    );

  const leaderboardFormDefaultValues = React.useMemo(() => {
    if (!leaderboard) {
      return undefined;
    }

    const defaultValues: LeaderboardFormData = {
      title: leaderboard.title,
      startDate: format(new Date(leaderboard.start), "yyyy-MM-dd"),
      startTime: format(new Date(leaderboard.start), "HH:mm"),
      endDate: leaderboard.end
        ? format(new Date(leaderboard.end), "yyyy-MM-dd")
        : "",
      theme: leaderboard.theme ?? undefined,
      isGlobal: leaderboard.global,
      isPublic: leaderboard.public,
    };
    return defaultValues;
  }, [leaderboard]);

  const onSubmit = React.useCallback(
    async (data: LeaderboardFormSubmitData) => {
      try {
        const updateLeaderboardRequest: UpdateLeaderboardRequest = data;
        const result = await fetch(`/api/leaderboards/${id}`, {
          method: "PUT",
          body: JSON.stringify(updateLeaderboardRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Leaderboard updated");
          const updatedLeaderboard = (await result.json()) as Leaderboard;
          mutateLeaderboard(updatedLeaderboard);
          router.push(`${PageRoutes.leaderboards}/${updatedLeaderboard.id}`);
        } else {
          toast.error("Failed to update leaderboard: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        toast.error("Leaderboard update failed. Please try again.");
      }
    },
    [id, mutateLeaderboard, router]
  );
  const deleteLeaderboard = React.useCallback(async () => {
    try {
      if (window.confirm("Are you sure you wish to delete this leaderboard?")) {
        const result = await fetch(`/api/leaderboards/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Leaderboard deleted");
          router.push(PageRoutes.leaderboard);
        } else {
          toast.error("Failed to delete leaderboard: " + result.statusText);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Leaderboard delete failed. Please try again.");
    }
  }, [id, router]);

  if (!leaderboard) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Text h3>✏️ Edit leaderboard</Text>
      <Spacer />
      <LeaderboardForm
        onSubmit={onSubmit}
        defaultValues={leaderboardFormDefaultValues}
        mode="update"
      />
      <Spacer y={8} />
      <Card variant="bordered" css={{ borderColor: "$error" }}>
        <Card.Body>
          <Row justify="center">
            <Button color="error" auto onClick={deleteLeaderboard}>
              Delete Leaderboard
            </Button>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default EditLeaderboard;
