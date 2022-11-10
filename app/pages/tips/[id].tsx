import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { Tip, TipStatus } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { ConfettiContainer } from "components/ConfettiContainer";
import { NextLink } from "components/NextLink";
import { ClaimProgressTracker } from "components/tipper/TipPage/ClaimProgressTracker";
import { PayTipInvoice } from "components/tipper/TipPage/PayTipInvoice";
import { ShareUnclaimedTip } from "components/tipper/TipPage/ShareUnclaimedTip";
import { TipPageStatusHeader } from "components/tipper/TipPage/TipPageStatusHeader";
import { notifyError, notifySuccess } from "components/Toasts";
import { formatDistance, isAfter } from "date-fns";
import { expirableTipStatuses, refundableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { nth } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { ExchangeRates } from "types/ExchangeRates";
import { Scoreboard } from "types/Scoreboard";
import { requestProvider } from "webln";

// poll tip status once per second to receive updates TODO: consider using websockets
const useTipConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [prevTipStatus, setPrevTipStatus] = React.useState<
    TipStatus | undefined
  >();

  const { mutate } = useSWRConfig();
  const mutateTips = React.useCallback(
    () => mutate("/api/tipper/tips"),
    [mutate]
  );

  const { data: tip } = useSWR<Tip>(
    id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher,
    useTipConfig
  );

  const tipStatus = tip?.status;
  const tipInvoice = tip?.invoice;

  React.useEffect(() => {
    if (prevTipStatus === "UNFUNDED" && tipStatus === "UNCLAIMED") {
      notifySuccess("Tip funded");
    }
    setPrevTipStatus(tipStatus);
  }, [prevTipStatus, tipStatus]);

  React.useEffect(() => {
    if (tipStatus === "UNFUNDED" && tipInvoice) {
      (async () => {
        try {
          console.log("Launching webln");
          const webln = await requestProvider();
          webln.sendPayment(tipInvoice);
        } catch (error) {
          console.error("Failed to load webln", error);
        }
      })();
    }
  }, [tipStatus, tipInvoice]);

  const { data: scoreboard } = useSWR<Scoreboard>(
    tip && tip.status === "WITHDRAWN" ? `/api/scoreboard` : null,
    defaultFetcher
  );

  const placing = scoreboard
    ? scoreboard.entries.findIndex((entry) => entry.isMe) + 1
    : undefined;

  const hasExpired =
    tip &&
    expirableTipStatuses.indexOf(tip.status) >= 0 &&
    isAfter(new Date(), new Date(tip.expiry));

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  const deleteTip = React.useCallback(() => {
    (async () => {
      router.push(Routes.home);
      const result = await fetch(`/api/tipper/tips/${id}`, {
        method: "DELETE",
      });
      if (!result.ok) {
        notifyError("Failed to delete tip: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, router, mutateTips]);

  const reclaimTip = React.useCallback(() => {
    (async () => {
      router.push(Routes.home);
      const result = await fetch(`/api/tipper/tips/${id}/reclaim`, {
        method: "POST",
      });
      if (!result.ok) {
        notifyError("Failed to reclaim tip: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, mutateTips, router]);

  if (tip) {
    return (
      <>
        {!hasExpired ? (
          <>
            <TipPageStatusHeader status={tip.status} />
            <Spacer />
            <ClaimProgressTracker tipId={tip.id} />
            <Spacer />

            {tip.status === "UNFUNDED" && tip.invoice && (
              <PayTipInvoice invoice={tip.invoice} />
            )}
            {tip.status === "UNCLAIMED" && <ShareUnclaimedTip tip={tip} />}
          </>
        ) : (
          <>
            <Text h2>Oh no! 😔</Text>
            <Text color="error">This tip has expired.</Text>
          </>
        )}

        {tip.status === "WITHDRAWN" && (
          <>
            <ConfettiContainer />
            <Spacer />
            <Text blockquote>
              Rumors say - those who gift bitcoin are a very special kind of
              people.
            </Text>
            <Spacer />
            {placing ? (
              <>
                <Text b>
                  {"You're"} now at&nbsp;
                  <Text
                    color="success"
                    b
                    size="large"
                    style={{ display: "inline" }}
                  >
                    {placing}
                    {nth(placing)}
                  </Text>
                  &nbsp; place on the{" "}
                  <NextLink href={Routes.scoreboard} passHref>
                    <Link style={{ display: "inline" }}>scoreboard</Link>
                  </NextLink>
                  !
                </Text>
                <Spacer />
              </>
            ) : (
              <Loading type="spinner" color="currentColor" size="sm" />
            )}
            <Spacer />
            <NextLink href={Routes.newTip} passHref>
              <a>
                <Button>Create another tip</Button>
              </a>
            </NextLink>

            <Spacer />
          </>
        )}

        <Spacer y={4} />
        {!hasExpired && expirableTipStatuses.indexOf(tip.status) > -1 && (
          <>
            <Text small>
              Expires in {formatDistance(new Date(tip.expiry), Date.now())}
            </Text>
            <Spacer />
          </>
        )}
        {tip.status === "UNFUNDED" && (
          <>
            <Button onClick={deleteTip} color="error">
              Delete Tip
            </Button>
            <Spacer />
          </>
        )}
        {refundableTipStatuses.indexOf(tip.status) >= 0 && (
          <>
            <Button onClick={reclaimTip} color="error">
              Reclaim Tip
            </Button>
            <Spacer />
          </>
        )}
        <BackButton />
      </>
    );
  } else {
    return (
      <>
        <Loading type="spinner" color="currentColor" size="lg" />
        <Text>Loading invoice</Text>
      </>
    );
  }
};

export default TipPage;
