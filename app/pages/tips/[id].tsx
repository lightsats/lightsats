import type { NextPage } from "next";
import { Link, Loading, Spacer, Text } from "@nextui-org/react";
import NextLink from "next/link";
import { Routes } from "../../lib/Routes";
import React from "react";
import { useRouter } from "next/router";
import { Tip } from "@prisma/client";
import useSWR, { SWRConfiguration } from "swr";
import { defaultFetcher } from "../../lib/swr";
import QRCode from "react-qr-code";
import { TipStatusBadge } from "../../components/tipper/TipStatusBadge";

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
            <QRCode value={tip.invoice} />
          </>
        )}
        {tip.status === "UNCLAIMED" && claimUrl && (
          <>
            <Text style={{ display: "inline-block" }}>
              Ask your tippee to scan the below code using their camera app or a
              QR code scanner app.
            </Text>
            <Spacer />
            <NextLink href={claimUrl}>
              <a>
                <QRCode value={claimUrl} />
              </a>
            </NextLink>
          </>
        )}
        <Spacer />
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
