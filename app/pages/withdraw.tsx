import {
  Button,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip, WithdrawalFlow } from "@prisma/client";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import copy from "copy-to-clipboard";
import { formatDistance, isBefore } from "date-fns";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration } from "swr";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { PublicTip } from "types/PublicTip";

const checkWithdrawalLinksConfig: SWRConfiguration = { refreshInterval: 1000 };
const useTipsConfig: SWRConfiguration = { refreshInterval: 1000 };

const Withdraw: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const flow = (router.query["flow"] as WithdrawalFlow) ?? "tippee";

  // poll to get updated statuses after withdrawing
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/${flow}/tips` : null,
    defaultFetcher,
    useTipsConfig
  );

  // poll withdraw links to check payment
  // this is unreliable because user might not come back to this page after receiving withdrawal confirmation in their wallet app
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data } = useSWR<unknown>(
    session ? `/api/users/${session.user.id}/checkWithdrawalLinks` : null,
    defaultFetcher,
    checkWithdrawalLinksConfig
  );

  const [invoice, setInvoice] = React.useState("");
  const [withdrawalLinkLnurl, setWithdrawalLinkLnurl] = React.useState("");
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
        const withdrawalRequest: InvoiceWithdrawalRequest = { invoice, flow };
        const result = await fetch("/api/invoices", {
          method: "POST",
          body: JSON.stringify(withdrawalRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          alert("Funds withdrawn!");
        } else {
          const body = await result.text();
          alert("Failed to withdraw: " + result.statusText + `\n${body}`);
        }
      } catch (error) {
        console.error(error);
        alert(
          "Withdrawal failed: " +
            JSON.stringify(error, Object.getOwnPropertyNames(error)) +
            ". Please try again."
        );
      }
      setSubmitting(false);
    })();
  }, [invoice, isSubmitting, flow]);

  const withdrawableTips = React.useMemo(
    () =>
      tips?.filter(
        (tip) =>
          (flow === "tippee" &&
            tip.status === "CLAIMED" &&
            isBefore(new Date(), new Date(tip.expiry))) ||
          (flow === "tipper" && tip.status === "RECLAIMED")
      ),
    [flow, tips]
  );

  const nextExpiry =
    flow === "tippee" &&
    withdrawableTips?.find(
      (tip) =>
        !withdrawableTips.some((other) =>
          isBefore(new Date(other.expiry), new Date(tip.expiry))
        )
    )?.expiry;

  const tipIds = React.useMemo(
    () =>
      flow === "tippee"
        ? tips
            ?.filter((tip) => tip.tippeeId === session?.user.id)
            .map((tip) => tip.id)
        : [],
    [session, flow, tips]
  );

  const availableBalance = withdrawableTips?.length
    ? withdrawableTips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;

  const hasWithdrawnTip = tips?.some((tip) => tip.status === "WITHDRAWN");
  React.useEffect(() => {
    if (availableBalance === 0 && flow === "tippee" && hasWithdrawnTip) {
      router.push(Routes.journeyCongratulations);
    }
  }, [availableBalance, flow, router, hasWithdrawnTip]);

  React.useEffect(() => {
    if (availableBalance > 0) {
      (async () => {
        const withdrawalRequest: LnurlWithdrawalRequest = {
          amount: availableBalance,
          flow,
        };
        const result = await fetch("/api/withdrawalLinks", {
          method: "POST",
          body: JSON.stringify(withdrawalRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          setWithdrawalLinkLnurl(await result.json());
        } else {
          const body = await result.text();
          alert(
            "Failed to create withdraw link: " + result.statusText + `\n${body}`
          );
        }
      })();
    }
  }, [availableBalance, flow]);

  const copyWithdrawLinkUrl = React.useCallback(() => {
    if (withdrawalLinkLnurl) {
      copy(withdrawalLinkLnurl);
      alert("Copied to clipboard");
    }
  }, [withdrawalLinkLnurl]);

  if (!session || !tips) {
    return <Text>{"Loading balance..."}</Text>;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Withdraw</title>
      </Head>
      {flow === "tippee" && <MyBitcoinJourneyHeader />}
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
          <Text>
            You have {availableBalance} reclaimed satoshis⚡ ready to withdraw.
          </Text>

          <Spacer />
          {withdrawalLinkLnurl ? (
            <>
              <Text>
                Scan, tap or copy the below link into your lightning wallet to
                Withdraw.
              </Text>
              <Spacer />
              <Loading type="points" color="currentColor" size="sm" />
              <Spacer />
              <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                <a>
                  <QRCode value={withdrawalLinkLnurl} />
                </a>
              </NextLink>
              <Spacer />
              <Button onClick={copyWithdrawLinkUrl}>Copy</Button>
            </>
          ) : (
            <>
              <Loading type="spinner" color="currentColor" size="sm" />
            </>
          )}
          <Spacer y={4} />
          <Text>Manual withdrawal</Text>
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
          {nextExpiry && (
            <>
              <Spacer y={0.5} />
              <Text small color="error">
                Expiring in {formatDistance(new Date(nextExpiry), Date.now())}
              </Text>
            </>
          )}
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
