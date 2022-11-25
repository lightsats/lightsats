import { Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { TipForm, TipFormSubmitData } from "components/TipForm";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { CreateTipRequest } from "types/TipRequest";

const NewTip: NextPage = () => {
  const router = useRouter();

  const onSubmit = React.useCallback(
    async (data: TipFormSubmitData) => {
      try {
        const createTipRequest: CreateTipRequest = {
          amount: data.satsAmount,
          currency: data.currency,
        };
        const result = await fetch("/api/tipper/tips", {
          method: "POST",
          body: JSON.stringify(createTipRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Tip created");
          const tip = (await result.json()) as Tip;
          // add tip to cache so it's immediately available
          mutate(`/api/tipper/tips/${tip.id}`, tip);
          router.push(`${Routes.tips}/${tip.id}`);
        } else {
          toast.error("Failed to create tip: " + result.statusText);
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
      <Text h3>💸 Create a new tip</Text>
      <Spacer />
      <TipForm onSubmit={onSubmit} mode="create" />
    </>
  );
};

export default NewTip;
