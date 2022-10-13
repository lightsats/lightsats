import type { NextPage } from "next";
import { Input, Button, Loading, Spacer } from "@nextui-org/react";
import { Routes } from "../../lib/Routes";
import React from "react";
import { CreateTipRequest } from "../../types/CreateTipRequest";
import { Tip } from "@prisma/client";
import { useRouter } from "next/router";

const NewTip: NextPage = () => {
  const router = useRouter();
  const [amount, setAmount] = React.useState(1000);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const submitForm = React.useCallback(() => {
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    if (amount <= 0) {
      throw new Error("No amount provided");
    }
    setSubmitting(true);

    (async () => {
      try {
        const createTipRequest: CreateTipRequest = {
          amount,
        };
        const result = await fetch("/api/tipper/tips", {
          method: "POST",
          body: JSON.stringify(createTipRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          const tip = (await result.json()) as Tip;
          router.push(`${Routes.tips}/${tip.id}`);
        } else {
          alert("Failed to create tip: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        alert("Tip creation failed. Please try again.");
      }
      setSubmitting(false);
    })();
  }, [amount, isSubmitting, router]);

  return (
    <>
      <Input
        label="Sats"
        type="number"
        value={amount.toString()}
        onChange={(event) => setAmount(parseInt(event.target.value || "0"))}
      />
      <Spacer />
      <Button onClick={submitForm} disabled={isSubmitting}>
        {isSubmitting ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Confirm</>
        )}
      </Button>
    </>
  );
};

export default NewTip;
