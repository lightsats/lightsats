import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { TipStatusBadge } from "components/tipper/TipStatusBadge";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React from "react";
import QRCode from "react-qr-code";
import useSWR, { SWRConfiguration } from "swr";

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

  const copyInvoice = React.useCallback(() => {
    if (tip) {
      navigator.clipboard.writeText(tip.invoice);
      alert("Copied to clipboard");
    }
  }, [tip]);

  const copyClaimUrl = React.useCallback(() => {
    if (claimUrl) {
      navigator.clipboard.writeText(claimUrl);
      alert("Copied to clipboard");
    }
  }, [claimUrl]);

  if (tip) {
    return (
      <>
        <TipStatusBadge status={tip.status} />
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
        <Spacer y={4} />
        <NextLink href={`${Routes.home}`}>
          <a>
            <Link>Back</Link>
          </a>
        </NextLink>
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
