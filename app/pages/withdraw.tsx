import {
  Button,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import { PublicTip } from "types/PublicTip";
import { WithdrawalFlow, WithdrawalRequest } from "types/WithdrawalRequest";

const Withdraw: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const flow = (router.query["flow"] as WithdrawalFlow) ?? "tippee";
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/${flow}/tips` : null,
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
        const withdrawalRequest: WithdrawalRequest = { invoice, flow };
        const result = await fetch("/api/withdraw", {
          method: "POST",
          body: JSON.stringify(withdrawalRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          alert("Funds withdrawn!");
        } else {
          alert("Failed to withdraw: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        alert("Withdrawal failed. Please try again.");
      }
      setSubmitting(false);
    })();
  }, [invoice, isSubmitting, flow]);

  const withdrawableTips = React.useMemo(
    () =>
      tips?.filter(
        (tip) =>
          (flow === "tippee" && tip.status === "CLAIMED") ||
          (flow === "tipper" && tip.status === "RECLAIMED")
      ),
    [flow, tips]
  );

  const tipIds = React.useMemo(
    () => (flow === "tippee" ? tips?.map((tip) => tip.id) : []),
    [flow, tips]
  );

  if (!session || !tips) {
    return <Text>{"Loading balance..."}</Text>;
  }

  const availableBalance = withdrawableTips.length
    ? withdrawableTips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;
  return (
    <>
      {!availableBalance ? (
        <>
          <Text>
            {`It doesn't look like you have any ${
              flow === "tippee" ? "claimed" : "reclaimed"
            } funds to withdraw right now.`}
          </Text>
          <Spacer />
          <NextLink href={Routes.home} passHref>
            <Link>Home</Link>
          </NextLink>
        </>
      ) : (
        <>
          {flow === "tippee" ? (
            <Text>
              Woohoo! you have {availableBalance} satoshis⚡ ready to withdraw.
            </Text>
          ) : (
            <Text>
              You have {availableBalance} reclaimed satoshis⚡ ready to
              withdraw.
            </Text>
          )}
          {flow === "tippee" && (
            <>
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
            </>
          )}
          <Text>
            Create an invoice for{" "}
            <strong>exactly {availableBalance} sats</strong> and paste the
            invoice into the field below.
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
      )}
      {tipIds && <Spacer />}
      {tipIds?.map((tipId) => (
        <ContactTipper key={tipId} tipId={tipId} />
      ))}
    </>
  );
};

export default Withdraw;

// this is inefficient as it does 1 call per tipper, but most users will probably only have one tipper
function ContactTipper({ tipId: tipperId }: { tipId: string }) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tipperId}`,
    defaultFetcher
  );
  if (!publicTip) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }
  return (
    <Row justify="center" align="center">
      <Text>
        Tipped {publicTip.amount} satoshis⚡ by{" "}
        {publicTip.tipper.name ?? "anonymous"}
      </Text>
      {publicTip.tipper.twitterUsername && (
        <>
          <Spacer />
          <NextLink
            href={`https://twitter.com/${publicTip.tipper.twitterUsername}`}
            passHref
          >
            <Link target="_blank">Contact via Twitter</Link>
          </NextLink>
        </>
      )}
    </Row>
  );
}
