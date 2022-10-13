import type { NextPage } from "next";
import { Container, Link, Spacer, Text } from "@nextui-org/react";
import NextLink from "next/link";
import { Routes } from "../../../lib/Routes";
import React from "react";
import { useRouter } from "next/router";
import { Tip } from "@prisma/client";
import useSWR from "swr";
import { defaultFetcher } from "../../../lib/swr";
import QRCode from "react-qr-code";

const ClaimTipPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <p>Loading tip {id}, please wait...</p>
    </>
  );
};

export default ClaimTipPage;
