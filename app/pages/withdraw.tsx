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
import { LightsatsQRCode } from "components/LightsatsQRCode";
import { NextLink } from "components/NextLink";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import copy from "copy-to-clipboard";
import { useTips } from "hooks/useTips";
import { getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { hasTipExpired } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { requestProvider } from "webln";

type WithdrawProps = {
  flow: WithdrawalFlow;
  tipId?: string;
};
// TODO: move to separate file
export function Withdraw({ flow, tipId }: WithdrawProps) {
  const { t } = useTranslation(["common", "withdraw"]);
  const { data: session } = useSession();
  const router = useRouter();

  // poll to get updated statuses after withdrawing
  const { data: tips } = useTips(flow, true, tipId);

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
          const withdrawalRequest: InvoiceWithdrawalRequest = {
            invoice,
            flow,
            tipId,
          };
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
    [isSubmitting, flow, tipId]
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
            !hasTipExpired(tip)) ||
          (flow === "tipper" && tip.status === "RECLAIMED") ||
          (flow === "anonymous" &&
            tip.status === "UNCLAIMED" &&
            !hasTipExpired(tip))
      ),
    [flow, tips]
  );

  const availableBalance = withdrawableTips?.length
    ? withdrawableTips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;

  const hasWithdrawnTip = tips?.some((tip) => tip.status === "WITHDRAWN");
  React.useEffect(() => {
    if (availableBalance === 0 && flow === "tippee" && hasWithdrawnTip) {
      router.push(PageRoutes.journeyCongratulations);
    }
  }, [availableBalance, flow, router, hasWithdrawnTip]);

  React.useEffect(() => {
    if (availableBalance > 0) {
      (async () => {
        const withdrawalRequest: LnurlWithdrawalRequest = {
          amount: availableBalance,
          flow,
          tipId,
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
  }, [availableBalance, flow, tipId]);
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

  if ((!session && flow !== "anonymous") || !tips) {
    return <Loading />;
  }

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
          <NextLink href={PageRoutes.dashboard} passHref>
            <Link>Home</Link>
          </NextLink>
        </>
      ) : (
        <div style={{ maxWidth: "100%" }}>
          <Text h3>
            {isSubmitting ? t("withdraw:withdrawing") : t("withdraw:title")}
          </Text>

          {withdrawalLinkLnurl && !isSubmitting ? (
            <>
              <Text>{t("withdraw:lnurlInstructions")}</Text>
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
                        {t("withdraw:withdrawAvailableBalance", {
                          availableBalance,
                        })}
                      </Text>
                    </Row>
                  </Card.Header>
                  <Card.Divider />
                  <Card.Body>
                    <FlexBox style={{ alignItems: "center" }}>
                      <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                        <a>
                          <LightsatsQRCode value={withdrawalLinkLnurl} />
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
                        {t("common:copy")}
                      </Button>
                      <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                        <a>
                          <Button auto>
                            <Icon>
                              <WalletIcon />
                            </Icon>
                            &nbsp;{t("common:openInWallet")}
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
    </>
  );
}

const WithdrawPage: NextPage = () => {
  const router = useRouter();
  const flow = (router.query["flow"] as WithdrawalFlow) ?? "tippee";

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Withdraw</title>
      </Head>
      {flow === "tippee" && <MyBitcoinJourneyHeader />}
      <Withdraw flow={flow} />
    </>
  );
};

export default WithdrawPage;

export { getStaticProps };
