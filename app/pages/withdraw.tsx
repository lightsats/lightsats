import { ClipboardDocumentIcon, WalletIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Collapse,
  Input,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { WithdrawalFlow } from "@prisma/client";
import { webln } from "alby-js-sdk";
import { Alert } from "components/Alert";
import { FlexBox } from "components/FlexBox";
import { HomeButton } from "components/HomeButton";
import { Icon } from "components/Icon";
import { LightningQRCode } from "components/LightningQRCode";
import { NextLink } from "components/NextLink";
import { ItemsList } from "components/items/ItemsList";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import copy from "copy-to-clipboard";
import { add } from "date-fns";
import { usePublicTip } from "hooks/usePublicTip";
import { useTips } from "hooks/useTips";
import { useUser } from "hooks/useUser";
import { PageRoutes } from "lib/PageRoutes";
import {
  MAX_TIPS_WITHDRAWABLE,
  MAX_TIP_SATS,
  WITHDRAWAL_RETRY_DELAY,
  unclaimedTipStatuses,
} from "lib/constants";
import { getStaticProps } from "lib/i18n/i18next";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import { hasTipExpired, tryGetErrorMessage } from "lib/utils";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Countdown from "react-countdown";
import toast from "react-hot-toast";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { MarkNonCustodialTipWithdrawnRequest } from "types/MarkNonCustodialTipWithdrawnRequest";

type WithdrawProps = {
  flow: WithdrawalFlow;
  tipId?: string; // only set for SKIP onboarding flow
  isPreview?: boolean;
};
// TODO: move to separate file
export function Withdraw({ flow, tipId, isPreview }: WithdrawProps) {
  const { t } = useTranslation(["common", "withdraw"]);
  const { data: session } = useSession();
  const router = useRouter();

  const { data: publicTip } = usePublicTip(tipId, true);
  const { data: user } = useUser(true);

  // poll to get updated statuses after withdrawing
  const { data: tips } = useTips(flow, true, tipId);

  const firstTip = tips?.[0];
  const firstTipType = firstTip?.type;
  const firstTipId = firstTip?.id;
  const [prevFirstTipId, setPrevFirstTipId] = React.useState(firstTipId);

  React.useEffect(() => {
    if (firstTipId) {
      setPrevFirstTipId(firstTipId);
    }
  }, [firstTipId]);

  const [invoiceFieldValue, setInvoiceFieldValue] = React.useState("");
  const [withdrawalLinkLnurl, setWithdrawalLinkLnurl] = React.useState("");
  const [prevWithdrawalLinkLnurl, setPrevWithdrawalLinkLnurl] =
    React.useState("");
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [hasLaunchedWebln, setLaunchedWebln] = React.useState(false);

  const lastWithdrawalTime = publicTip?.lastWithdrawal ?? user?.lastWithdrawal;

  const executeWithdrawal = React.useCallback(
    (invoice: string, isWebln: boolean) => {
      if (!firstTipType) {
        toast.error("Withdrawal not ready");
        return;
      }
      if (isPreview) {
        toast.error("You cannot withdraw your own tip");
        return;
      }
      if (isSubmitting) {
        toast.error("Already submitting");
        return;
      }
      setSubmitting(true);

      (async () => {
        try {
          if (firstTipType === "CUSTODIAL") {
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
            if (!result.ok) {
              const body = await result.text();
              toast.error(
                "Failed to withdraw: " + result.statusText + `\n${body}`
              );
            }
          } else if (firstTipType === "NON_CUSTODIAL_NWC") {
            const nostrWalletConnectUrl = localStorage.getItem(
              "nostrWalletConnectUrl"
            );
            if (!nostrWalletConnectUrl) {
              throw new Error("no nostrWalletConnectUrl set");
            }
            console.log("Creating noswebln", nostrWalletConnectUrl);
            const noswebln = new webln.NostrWebLNProvider({
              nostrWalletConnectUrl,
            });
            console.log("Enabling noswebln");
            await noswebln.enable();
            console.log("Sending payment");
            const response = await noswebln.sendPayment(invoice);
            console.log("Done", response);
            noswebln.close();
            localStorage.removeItem("nostrWalletConnectUrl");

            // TODO: is there a better way to mark the tip as withdrawn which doesn't rely on the recipient's client?
            const request: MarkNonCustodialTipWithdrawnRequest = {
              invoice,
              withdrawalMethod: isWebln ? "webln" : "invoice", // TODO: support lnurlw
            };
            const result = await fetch(
              `/api/tippee/tips/${firstTipId}/markWithdrawn`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
              }
            );
            if (!result.ok) {
              const body = await tryGetErrorMessage(result);
              toast.error(
                "Failed to mark tip as withdrawn: " +
                  result.statusText +
                  `\n${body}`
              );
            }
          } else {
            throw new Error("Unsupported tip type: " + firstTipType);
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
    [firstTipType, isPreview, isSubmitting, flow, tipId, firstTipId]
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
            unclaimedTipStatuses.indexOf(tip.status) > -1 &&
            !hasTipExpired(tip))
      ),
    [flow, tips]
  );

  const availableBalance = withdrawableTips?.length
    ? withdrawableTips.map((tip) => tip.amount).reduce((a, b) => a + b)
    : 0;

  const balanceIsOverLimit =
    availableBalance > MAX_TIP_SATS ||
    (withdrawableTips?.length || 0) > MAX_TIPS_WITHDRAWABLE;

  const [prevAvailableBalance, setPrevAvailableBalance] =
    React.useState(availableBalance);
  const [hasWithdrawn, setWithdrawn] = React.useState(false);
  const tippeeWithdrawnTipsCount = tips?.filter(
    (tip) => tip.status === "WITHDRAWN"
  ).length;
  const [initialTippeeWithdrawnTipsCount, setInitialTippeeWithdrawnTipsCount] =
    React.useState<number | undefined>(tippeeWithdrawnTipsCount);
  React.useEffect(() => {
    if (initialTippeeWithdrawnTipsCount === undefined) {
      setInitialTippeeWithdrawnTipsCount(tippeeWithdrawnTipsCount);
    }
  }, [initialTippeeWithdrawnTipsCount, tippeeWithdrawnTipsCount]);

  React.useEffect(() => {
    if (prevAvailableBalance > 0 && availableBalance === 0) {
      // Available balance dropped to 0, so most likely a successful withdrawal.

      // For the anonymous flow we cannot know if this person or someone else withdrew the tip.
      // In that case the claim page will be updated to provide the user with options of what to do next
      // (e.g. create an account or send a tip).

      // For a tippee, there is a chance the tipper could have reclaimed the tip before it was withdrawn
      // (also decreasing the tippee's available balance)
      // so there is also a check to make sure the tippee's number of withdrawn tips has increased.
      if (
        flow === "tipper" ||
        (flow === "tippee" &&
          initialTippeeWithdrawnTipsCount !== undefined &&
          tippeeWithdrawnTipsCount &&
          tippeeWithdrawnTipsCount > initialTippeeWithdrawnTipsCount)
      ) {
        setWithdrawn(true);
        toast.success("Funds withdrawn!", { duration: 5000 });
        if (flow === "tipper") {
          router.push(PageRoutes.dashboard);
        } else {
          router.push(
            `${PageRoutes.journeyCongratulations}?tipId=${prevFirstTipId}`
          );
        }
      }
    }
    setPrevAvailableBalance(availableBalance);
  }, [
    availableBalance,
    flow,
    initialTippeeWithdrawnTipsCount,
    prevAvailableBalance,
    router,
    tippeeWithdrawnTipsCount,
    prevFirstTipId,
  ]);

  React.useEffect(() => {
    if (balanceIsOverLimit) {
      return;
    }
    if (firstTipType !== "CUSTODIAL") {
      // TODO: use LNURL-withdraw to request an invoice from the user's wallet and then return it
      // to the webapp so they don't need to enter it manually
      return;
    }
    if (isPreview) {
      // just use a non-existent withdraw url as a demo
      setWithdrawalLinkLnurl(
        "lnurl1dp68gurn8ghj7mrfva58gumpw3ejucm0d5hkzurf9amkjargv3exzampd3xxjmntwvhkummw94jhs6tnw3jkuaqjn6jlg"
      );
    }
    if (availableBalance > 0 && !isPreview) {
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
  }, [
    availableBalance,
    flow,
    tipId,
    isPreview,
    firstTipType,
    balanceIsOverLimit,
  ]);

  React.useEffect(() => {
    if (
      withdrawalLinkLnurl &&
      prevWithdrawalLinkLnurl &&
      prevWithdrawalLinkLnurl !== withdrawalLinkLnurl
    ) {
      toast.success("QR code updated");
    }
    setPrevWithdrawalLinkLnurl(withdrawalLinkLnurl);
  }, [prevWithdrawalLinkLnurl, withdrawalLinkLnurl]);

  React.useEffect(() => {
    if (availableBalance > 0 && !isPreview && !balanceIsOverLimit) {
      (async () => {
        if (window.webln) {
          try {
            if (!hasLaunchedWebln) {
              setLaunchedWebln(true);
              console.log("Launching webln");
              await window.webln.enable();
              const makeInvoiceResponse = await window.webln.makeInvoice({
                amount: availableBalance,
              });
              executeWithdrawal(makeInvoiceResponse.paymentRequest, true);
            }
          } catch (error) {
            console.error("Failed to load webln", error);
          }
        }
      })();
    }
  }, [
    availableBalance,
    balanceIsOverLimit,
    executeWithdrawal,
    flow,
    hasLaunchedWebln,
    isPreview,
  ]);

  const copyWithdrawLinkUrl = React.useCallback(() => {
    if (withdrawalLinkLnurl) {
      copy(withdrawalLinkLnurl);
      toast.success("Copied to clipboard");
    }
  }, [withdrawalLinkLnurl]);

  const walletCategoryFilterOptions: CategoryFilterOptions = React.useMemo(
    () => ({
      checkTippeeBalance: true,
      tippeeBalance: availableBalance,
      recommendedLimit: 1,
      shadow: false,
      recommendedItemId:
        flow === "anonymous"
          ? withdrawableTips?.[0]?.recommendedWalletId ?? undefined
          : undefined,
    }),
    [availableBalance, flow, withdrawableTips]
  );

  const wasRecentlyWithdrawn =
    lastWithdrawalTime &&
    Date.now() - new Date(lastWithdrawalTime).getTime() <
      WITHDRAWAL_RETRY_DELAY;

  if (balanceIsOverLimit) {
    return (
      <>
        <Text h3>Manual Withdraw Unavailable</Text>
        <Text h5>
          {availableBalance} sats, {withdrawableTips?.length} tips
        </Text>
        <Text>
          Sorry, your balance is too large or you have too many tips to be
          processed within a single payment.&nbsp;
          {user?.lightningAddress ? (
            <>
              Multiple payments of up to a maximum of {MAX_TIP_SATS} sats or{" "}
              {MAX_TIPS_WITHDRAWABLE} tips will be sent to{" "}
              <b>{user.lightningAddress}</b> over the next few days.
            </>
          ) : (
            <>
              Please set a lightning address in your profile so your sats can be
              returned to you in multiple payments.
            </>
          )}
        </Text>
      </>
    );
  }

  if ((!session && flow !== "anonymous") || !tips) {
    return <Loading />;
  }

  return (
    <>
      {hasWithdrawn ? (
        <>
          {/* show loading spinner while redirecting */}
          <Loading />
        </>
      ) : !availableBalance ? (
        <>
          <Text>
            {`It doesn't look like you have any ${
              flow === "tippee" ? "claimed" : "reclaimed"
            } funds to withdraw right now.`}
          </Text>
          <Spacer />
          <HomeButton />
        </>
      ) : (
        <div style={{ maxWidth: "100%" }}>
          <Text h3>
            {isSubmitting || wasRecentlyWithdrawn
              ? t("withdraw:withdrawing")
              : t("withdraw:title")}
          </Text>
          {wasRecentlyWithdrawn && (
            <>
              <Text>
                A withdrawal is in progress. Please wait...&nbsp;
                <Countdown
                  renderer={(props) => <>{props.seconds}</>}
                  date={add(new Date(lastWithdrawalTime), {
                    seconds: WITHDRAWAL_RETRY_DELAY / 1000,
                  })}
                ></Countdown>
              </Text>
              <Spacer />
            </>
          )}

          {withdrawalLinkLnurl && !isSubmitting && !wasRecentlyWithdrawn ? (
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
                    <FlexBox
                      style={{ alignItems: "center", position: "relative" }}
                    >
                      {isPreview && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 10,
                            bottom: "10px",
                          }}
                        >
                          <Alert>
                            <Text b>
                              Example QR
                              <br />
                              Do not withdraw
                            </Text>
                          </Alert>
                        </div>
                      )}
                      <NextLink href={`lightning:${withdrawalLinkLnurl}`}>
                        <a>
                          <LightningQRCode value={withdrawalLinkLnurl} />
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
          ) : firstTipType === "CUSTODIAL" ? (
            <Row justify="center">
              <Loading />
            </Row>
          ) : null}
          {!isSubmitting && !wasRecentlyWithdrawn && (
            <>
              <Spacer y={1} />
              {flow === "anonymous" && (
                <>
                  <Collapse shadow title={<Text b>👛 Need a wallet?</Text>}>
                    <ItemsList
                      category="wallets"
                      options={walletCategoryFilterOptions}
                    />
                  </Collapse>
                  <Spacer />
                </>
              )}
              <Collapse shadow title={<Text b>🧾 Manual withdrawal</Text>}>
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
                  placeholder="lnbc..."
                  value={invoiceFieldValue}
                  onChange={(event) => setInvoiceFieldValue(event.target.value)}
                />
                <Spacer />
                <Row justify="center">
                  <Button onClick={submitForm} disabled={!invoiceFieldValue}>
                    Withdraw
                  </Button>
                </Row>
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
