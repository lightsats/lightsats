import {
  Badge,
  Button,
  Link,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { ConfettiContainer } from "components/ConfettiContainer";
import { FiatPrice } from "components/FiatPrice";
import { NextLink } from "components/NextLink";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import copy from "copy-to-clipboard";
import { formatDistance, isAfter } from "date-fns";
import {
  DEFAULT_FIAT_CURRENCY,
  expirableTipStatuses,
  refundableTipStatuses,
} from "lib/constants";
import { bitcoinJourneyPages, Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import { getLocalePath, nth } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { ExchangeRates } from "types/ExchangeRates";
import { PublicTip } from "types/PublicTip";
import { Scoreboard } from "types/Scoreboard";
import { requestProvider } from "webln";

// TODO: polling speed should be based on tip status - only UNFUNDED needs a fast poll rate
const useTipConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

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

  const claimUrl =
    global.window && tip
      ? `${window.location.origin}${getLocalePath(tip.tippeeLocale)}${
          Routes.tips
        }/${id}/claim`
      : undefined;

  const tipStatus = tip?.status;
  const tipInvoice = tip?.invoice;

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

  const { data: publicTip } = useSWR<PublicTip>(
    tip && tip.status === "CLAIMED" ? `/api/tippee/tips/${id}` : null,
    defaultFetcher,
    useTipConfig
  );

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

  const copyInvoice = React.useCallback(() => {
    if (tip?.invoice) {
      copy(tip.invoice);
      alert("Copied to clipboard");
    }
  }, [tip]);

  const deleteTip = React.useCallback(() => {
    (async () => {
      router.push(Routes.home);
      const result = await fetch(`/api/tipper/tips/${id}`, {
        method: "DELETE",
      });
      if (!result.ok) {
        alert("Failed to delete tip: " + result.statusText);
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
        alert("Failed to reclaim tip: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, mutateTips, router]);

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      copy(claimUrl);
      alert("Copied to clipboard");
    }
  }, [claimUrl]);

  if (tip) {
    return (
      <>
        <Row align="center" justify="center">
          <TipStatusBadge status={tip.status} />
          <Spacer x={0.5} />
          <Badge color="default">
            <Text size="small" color="white">
              {tip.amount}⚡{" "}
            </Text>
            <Text size="x-small" color="white">
              +{tip.fee}
            </Text>
          </Badge>
          <Spacer x={0.5} />
          <Badge color="default">
            <FiatPrice
              currency={tip.currency ?? DEFAULT_FIAT_CURRENCY}
              exchangeRate={
                exchangeRates?.[tip.currency ?? DEFAULT_FIAT_CURRENCY]
              }
              sats={tip.amount}
            />
          </Badge>
          {tip.note && (
            <>
              <Spacer x={0.5} />
              <Button color="default" auto onClick={() => alert(tip.note)}>
                💬
              </Button>
            </>
          )}
        </Row>
        <Spacer />
        <Text small>
          Created {formatDistance(Date.now(), new Date(tip.created))} ago
        </Text>
        {!hasExpired && expirableTipStatuses.indexOf(tip.status) > -1 && (
          <>
            <Spacer y={0.5} />
            <Text small>
              Expires in {formatDistance(new Date(tip.expiry), Date.now())}
            </Text>
          </>
        )}
        <Spacer />
        {tip.status === "WITHDRAWN" && (
          <>
            <ConfettiContainer />
            <h2>You did it 🎉</h2>
            <Spacer />
            <Text>{"You've"} just started someone on their 🍊💊 journey!</Text>
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
        {!hasExpired && tip.status === "UNFUNDED" && tip.invoice && (
          <>
            <Text>Waiting for payment</Text>
            <Loading type="points" color="currentColor" size="sm" />
            <Spacer />
            <NextLink href={`lightning:${tip.invoice}`}>
              <a>
                <QRCode value={tip.invoice} />
              </a>
            </NextLink>
            <Spacer />
            <Text size="small">
              Tap the QR code above to open your lightning wallet.
            </Text>
            <Spacer />
            <Button onClick={copyInvoice}>Copy</Button>
          </>
        )}
        {!hasExpired &&
          tip.status === "CLAIMED" &&
          (publicTip && publicTip.tippee ? (
            <>
              <Text style={{ textAlign: "center" }}>
                Your recipient is on their Bitcoin Journey!
              </Text>
              <Spacer />
              <Progress
                value={
                  (publicTip.tippee.journeyStep / bitcoinJourneyPages.length) *
                  100
                }
                color="success"
                status="success"
              />
              <Text blockquote>
                On page {bitcoinJourneyPages[publicTip.tippee.journeyStep - 1]}
              </Text>

              <Spacer />
            </>
          ) : (
            <Loading type="spinner" color="currentColor" size="sm" />
          ))}
        {!hasExpired && tip.status === "UNCLAIMED" && claimUrl && (
          <>
            <Text style={{ textAlign: "center" }}>
              Ask the tippee to scan the below code using their camera app or a
              QR code scanner app.
            </Text>
            <Spacer />
            <NextLink href={claimUrl}>
              <a>
                <QRCode value={claimUrl} />
              </a>
            </NextLink>
            <Spacer />
            <Button onClick={copyClaimUrl}>Copy URL</Button>
            <Spacer />
            <Text
              blockquote
              color={tip.claimLinkViewed ? "success" : undefined}
            >
              {tip.claimLinkViewed
                ? "This tip has been viewed!"
                : "This tip hasn't been viewed yet."}
            </Text>
          </>
        )}
        {hasExpired && (
          <>
            <Spacer />
            <Text color="error">This tip has expired.</Text>
          </>
        )}
        {tip.status === "UNFUNDED" && (
          <>
            <Spacer />
            <Button onClick={deleteTip} color="error">
              Delete Tip
            </Button>
          </>
        )}

        {refundableTipStatuses.indexOf(tip.status) >= 0 && (
          <>
            <Spacer />
            <Button onClick={reclaimTip} color="error">
              Reclaim Tip
            </Button>
          </>
        )}
        <Spacer y={2} />
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
