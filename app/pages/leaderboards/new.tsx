import { Spacer, Text } from "@nextui-org/react";
import { Leaderboard } from "@prisma/client";
import {
  LeaderboardForm,
  LeaderboardFormSubmitData,
} from "components/LeaderboardForm";
import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { CreateLeaderboardRequest } from "types/LeaderboardRequest";

const NewLeaderboard: NextPage = () => {
  const router = useRouter();

  const onSubmit = React.useCallback(
    async (data: LeaderboardFormSubmitData) => {
      try {
        const createLeaderboardRequest: CreateLeaderboardRequest = {
          title: data.title,
        };
        const result = await fetch("/api/leaderboards", {
          method: "POST",
          body: JSON.stringify(createLeaderboardRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Leaderboard created");
          const leaderboard = (await result.json()) as Leaderboard;
          router.push(`${PageRoutes.leaderboards}/${leaderboard.id}`);
        } else {
          toast.error("Failed to create leaderboard: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        toast.error("Tip creation failed. Please try again.");
      }
    },
    [router]
  );

  return (
    <>
      <Text h3>🏆 Create a new leaderboard</Text>
      <Spacer />
      <LeaderboardForm onSubmit={onSubmit} mode="create" />
    </>
  );
};

export default NewLeaderboard;
