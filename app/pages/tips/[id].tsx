import { Badge, Button, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import copy from "copy-to-clipboard";
import { formatDistance, isAfter } from "date-fns";
import {
  DEFAULT_FIAT_CURRENCY,
  expirableTipStatuses,
  refundableTipStatuses,
} from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { ExchangeRates } from "types/ExchangeRates";

// TODO: polling speed should be based on tip status - only UNFUNDED needs a fast poll rate
const useTipConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const claimUrl = global.window
    ? `${window.location.origin}/${Routes.tips}/${id}/claim`
    : undefined;
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

  const hasExpired =
    tip &&
    expirableTipStatuses.indexOf(tip.status) >= 0 &&
    isAfter(new Date(), new Date(tip.expiry));

  const { data: exchangeRates } = useSWR<ExchangeRates>(
    `/api/exchange/rates`,
    defaultFetcher
  );

  const copyInvoice = React.useCallback(() => {
    if (tip) {
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
          <Badge color="default">{tip.amount}⚡</Badge>
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
              <Button
                color="default"
                auto
                icon={"💬"}
                onClick={() => alert(tip.note)}
              ></Button>
            </>
          )}
        </Row>
        <Spacer />
        <Text small>
          Created {formatDistance(Date.now(), new Date(tip.created))} ago
        </Text>
        {!hasExpired && (
          <>
            <Spacer y={0.5} />
            <Text small>
              Expires in {formatDistance(new Date(tip.expiry), Date.now())}
            </Text>
          </>
        )}
        <Spacer />
        {!hasExpired && tip.status === "UNFUNDED" && (
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
        {tip.status === "WITHDRAWAL_FAILED" && (
          <>
            <Spacer />
            <Text style={{ textAlign: "center" }}>
              Withdrawal failed: {tip.payInvoiceStatus}{" "}
              {tip.payInvoiceStatusText}
            </Text>
            <Spacer />
            {tip.payInvoiceErrorBody && (
              <>
                <Text style={{ textAlign: "center" }}>
                  {tip.payInvoiceErrorBody}
                </Text>
              </>
            )}
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
        <Spacer y={4} />
        <BackButton />
      </>
    );
  } else {
    return (
      <>
        <Text>Loading invoice</Text>
        <Loading type="spinner" color="currentColor" size="sm" />
      </>
    );
  }
};

export default TipPage;
