import type { NextPage } from "next";
import { Container, Link, Spacer, Text } from "@nextui-org/react";
import NextLink from "next/link";
import { Routes } from "../../lib/Routes";
import React from "react";
import { useRouter } from "next/router";
import { Tip } from "@prisma/client";
import useSWR from "swr";
import { defaultFetcher } from "../../lib/swr";
import QRCode from "react-qr-code";

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const claimUrl = global.window
    ? `${window.location.origin}/${Routes.tips}/${id}/claim`
    : undefined;
  const { data: tip } = useSWR<Tip>(
    id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher
  );

  if (tip) {
    return (
      <>
        <Text>Status: {tip.status}</Text>
        {tip.status === "UNFUNDED" && (
          <>
            <Text>Please pay the invoice below.</Text>
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
        <p>Loading invoice, please wait...</p>
      </>
    );
  }
};

export default TipPage;
