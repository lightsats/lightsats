import type { NextPage } from "next";
import { Text, Button, Loading, Spacer, Link, Input } from "@nextui-org/react";
import React from "react";
import { WithdrawalRequest } from "../types/WithdrawalRequest";
import useSWR from "swr";
import { defaultFetcher } from "../lib/swr";
import { useSession } from "next-auth/react";
import { Tip } from "@prisma/client";
import NextLink from "next/link";
import { Routes } from "../lib/Routes";

const Withdraw: NextPage = () => {
  const { data: session } = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? "/api/tippee/tips" : null,
    defaultFetcher
  );
  const [invoice, setInvoice] = React.useState("");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const submitForm = React.useCallback(() => {
    if (!invoice) {
      throw new Error("No invoice set");
    }
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    setSubmitting(true);

    (async () => {
      try {
        const withdrawalRequest: WithdrawalRequest = { invoice };
        const result = await fetch("/api/tippee/withdraw", {
          method: "POST",
          body: JSON.stringify(withdrawalRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          // FIXME: show the withdrawal QR
          alert("Funds withdrawn. Woohoo!");
        } else {
          alert("Failed to withdraw: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        alert("Withdrawal failed. Please try again.");
      }
      setSubmitting(false);
    })();
  }, [invoice, isSubmitting]);

  if (!session || !tips) {
    return <Text>{"Loading balance..."}</Text>;
  }

  const claimedTips = tips.filter((tip) => tip.status === "CLAIMED");
  const availableBalance = claimedTips.length
    ? claimedTips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;
  if (!availableBalance) {
    return (
      <>
        <Text>
          {
            "It doesn't look like you have any claimed funds to withdraw right now."
          }
        </Text>
        <Spacer />
        <NextLink href={`${Routes.home}`}>
          <a>
            <Link>Home</Link>
          </a>
        </NextLink>
      </>
    );
  }
  return (
    <>
      <Text>
        Woohoo! you have {availableBalance} satoshis⚡ ready to withdraw.
      </Text>
      <Spacer />
      <Text>{"you can use Bitcoin online in a variety of ways:"}</Text>
      <ul>
        <li>load a virtual credit card</li>
        <li>buy gift cards</li>
        <li>post on stacker.news</li>
        <li>HODL</li>
        <li>and much more!</li>
      </ul>

      <Text>
        {
          "In order to spend your funds you'll first need to withdraw them to a lightning wallet."
        }
      </Text>
      <Text>
        Create an invoice for <strong>exactly {availableBalance} sats</strong>{" "}
        and paste the invoice into the field below.
      </Text>
      <Text color="warning">
        If the invoice amount does not match your available balance, the
        transaction will fail.
      </Text>

      <Spacer />
      <Input
        label="Lightning Invoice"
        fullWidth
        value={invoice}
        onChange={(event) => setInvoice(event.target.value)}
      />
      <Spacer />
      <Button onClick={submitForm} disabled={isSubmitting || !invoice}>
        {isSubmitting ? (
          <Loading type="points" color="currentColor" size="sm" />
        ) : (
          <>Withdraw</>
        )}
      </Button>
    </>
  );
};

export default Withdraw;
