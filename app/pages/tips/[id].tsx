import type { NextPage } from "next";
import { Container, Link, Text } from "@nextui-org/react";
import NextLink from "next/link";
import { Routes } from "../../lib/Routes";
import React from "react";
import { useRouter } from "next/router";
import { Tip } from "@prisma/client";
import useSWR from "swr";
import { defaultFetcher } from "../../lib/swr";

const TipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useSWR<Tip>(
    id ? `/api/tipper/tips/${id}` : null,
    defaultFetcher
  );

  if (tip) {
    return (
      <>
        <Text>Status: {tip.status}</Text>
        {tip.status === "UNFUNDED" && (
          <Container xs>
            <Text style={{ wordWrap: "break-word" }}>
              Please pay invoice: {tip.invoice}
            </Text>
          </Container>
        )}
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
