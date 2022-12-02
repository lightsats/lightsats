import { ClipboardDocumentIcon, WalletIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Collapse,
  Input,
  Link,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { WithdrawalFlow } from "@prisma/client";
import { Alert } from "components/Alert";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import copy from "copy-to-clipboard";
import { isBefore } from "date-fns";
import { useTips } from "hooks/useTips";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { requestProvider } from "webln";

const Withdraw: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const flow = (router.query["flow"] as WithdrawalFlow) ?? "tippee";

  // poll to get updated statuses after withdrawing
  const { data: tips } = useTips(flow, true);

  const [invoiceFieldValue, setInvoiceFieldValue] = React.useState("");
  const [withdrawalLinkLnurl, setWithdrawalLinkLnurl] = React.useState("");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [hasLaunchedWebln, setLaunchedWebln] = React.useState(false);

  const executeWithdrawal = React.useCallback(
    (invoice: string, isWebln: boolean) => {
      if (isSubmitting) {
        throw new Error("Already submitting");
      }
      setSubmitting(true);

      (async () => {
        try {
          const withdrawalRequest: InvoiceWithdrawalRequest = { invoice, flow };
          const result = await fetch(`/api/invoices?isWebln=${isWebln}`, {
            method: "POST",
            body: JSON.stringify(withdrawalRequest),
            headers: { "Content-Type": "application/json" },
          });
          if (result.ok) {
            toast.success("Funds withdrawn!", { duration: 5000 });
          } else {
            const body = await result.text();
            toast.error(
              "Failed to withdraw: " + result.statusText + `\n${body}`
            );
          }
        } catch (error) {
          console.error(error);
          toast.error(
            "Withdrawal failed: " +
              JSON.stringify(error, Object.getOwnPropertyNames(error)) +
              ". Please try again."
          );
        }
        setSubmitting(false);
      })();
    },
    [isSubmitting, flow]
  );

  const submitForm = React.useCallback(() => {
    if (!invoiceFieldValue) {
      throw new Error("No invoice set");
    }
    executeWithdrawal(invoiceFieldValue, false);
  }, [executeWithdrawal, invoiceFieldValue]);

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

  // const nextExpiry =
  //   flow === "tippee" &&
  //   withdrawableTips?.find(
  //     (tip) =>
  //       !withdrawableTips.some((other) =>
  //         isBefore(new Date(other.expiry), new Date(tip.expiry))
  //       )
  //   )?.expiry;

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
          toast.error(
            "Failed to create withdraw link: " + result.statusText + `\n${body}`
          );
        }
      })();
    }
  }, [availableBalance, flow]);
  React.useEffect(() => {
    if (availableBalance > 0) {
      (async () => {
        try {
          if (!hasLaunchedWebln) {
            console.log("Launching webln");
            setLaunchedWebln(true);
            const webln = await requestProvider();
            const makeInvoiceResponse = await webln.makeInvoice({
              amount: availableBalance,
            });
            executeWithdrawal(makeInvoiceResponse.paymentRequest, true);
          }
        } catch (error) {
          console.error("Failed to load webln", error);
        }
      })();
    }
  }, [availableBalance, executeWithdrawal, flow, hasLaunchedWebln]);

  const copyWithdrawLinkUrl = React.useCallback(() => {
    if (withdrawalLinkLnurl) {
      copy(withdrawalLinkLnurl);
      toast.success("Copied to clipboard");
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
          <NextLink href={Routes.dashboard} passHref>
            <Link>Home</Link>
          </NextLink>
        </>
      ) : (
        <div style={{ maxWidth: "100%" }}>
          <Text h3>
            {isSubmitting ? "Withdrawing..." : "Ready to withdraw?"}
          </Text>

          {withdrawalLinkLnurl && !isSubmitting ? (
            <>
              <Text>
                Scan, tap or copy the below link into your bitcoin wallet to
                withdraw them.
              </Text>
              <Spacer />
              <FlexBox>
                <Card
                  color="primary"
                  css={{
                    dropShadow: "$sm",
                  }}
                >
                  <Card.Header>
                    <Row justify="center">
                      <Text>
                        Withdraw <strong>{availableBalance} sats</strong> to
                        your wallet
                      </Text>
                    </Row>
                  </Card.Header>
                  <Card.Divider />
                  <Card.Body>
                    <FlexBox style={{ alignItems: "center" }}>
                      <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                        <a>
                          <QRCode value={withdrawalLinkLnurl} />
                        </a>
                      </NextLink>
                    </FlexBox>
                  </Card.Body>
                  <Card.Divider />
                  <Card.Footer>
                    <Row justify="space-between">
                      <Button
                        auto
                        color="secondary"
                        onClick={copyWithdrawLinkUrl}
                      >
                        <Icon>
                          <ClipboardDocumentIcon />
                        </Icon>
                        Copy
                      </Button>
                      <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                        <a>
                          <Button auto>
                            <Icon>
                              <WalletIcon />
                            </Icon>
                            &nbsp; Open in wallet
                          </Button>
                        </a>
                      </NextLink>
                    </Row>
                  </Card.Footer>
                </Card>
              </FlexBox>
            </>
          ) : (
            <Row justify="center">
              <Loading />
            </Row>
          )}
          {!isSubmitting && (
            <>
              <Spacer y={1} />
              <Collapse shadow title={<Text b>Manual withdrawal</Text>}>
                <Text>
                  Create an invoice for exactly&nbsp;
                  <strong>{availableBalance} sats</strong> and paste the invoice
                  into the field below.
                </Text>
                <Spacer />
                <Alert>
                  <Text small>
                    If the invoice amount does not match your available balance,
                    the transaction will fail.
                  </Text>
                </Alert>
                <Text color="warning"></Text>
                <Spacer />
                <Input
                  label="Lightning Invoice"
                  fullWidth
                  value={invoiceFieldValue}
                  onChange={(event) => setInvoiceFieldValue(event.target.value)}
                />
                <Spacer />
                <Button
                  onClick={submitForm}
                  disabled={isSubmitting || !invoiceFieldValue}
                >
                  {isSubmitting ? (
                    <Loading color="currentColor" size="sm" />
                  ) : (
                    <>Withdraw</>
                  )}
                </Button>
              </Collapse>
            </>
          )}
        </div>
      )}
      {tipIds && <Spacer />}
    </>
  );
};

export default Withdraw;

/*// this is inefficient as it does 1 call per tipper, but most users will probably only have one tipper
function ContactTipper({ tipId: tipperId }: { tipId: string }) {
  const { data: publicTip } = useSWR<PublicTip>(
    `/api/tippee/tips/${tipperId}`,
    defaultFetcher
  );
  if (!publicTip) {
    return <Loading color="currentColor" size="sm" />;
  }
  return (
    <Row justify="center" align="center">
      <Text>
        Tipped {publicTip.amount} satoshis⚡ by{" "}
        {publicTip.tipper.name ?? DEFAULT_NAME}
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
}*/
