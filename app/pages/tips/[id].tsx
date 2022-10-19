import { Badge, Button, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { BackButton } from "components/BackButton";
import { FiatPrice } from "components/FiatPrice";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import copy from "copy-to-clipboard";
import { DEFAULT_FIAT_CURRENCY, refundableTipStatuses } from "lib/constants";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration } from "swr";
import { ExchangeRates } from "types/ExchangeRates";

// TODO: polling speed should be based on tip status - only UNFUNDED needs a fast poll rate
const useTipConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const claimUrl = global.window
    ? `${window.location.origin}/${Routes.tips}/${id}/claim`
    : undefined;

  const { data: tip } = useSWR<Tip>(
    id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher,
    useTipConfig
  );
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
      }
    })();
  }, [id, router]);

  const reclaimTip = React.useCallback(() => {
    (async () => {
      router.push(Routes.home);
      const result = await fetch(`/api/tipper/tips/${id}/reclaim`, {
        method: "POST",
      });
      if (!result.ok) {
        alert("Failed to reclaim tip: " + result.statusText);
      }
    })();
  }, [id, router]);

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
        {tip.status === "UNFUNDED" && (
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
        {tip.status === "UNCLAIMED" && claimUrl && (
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
