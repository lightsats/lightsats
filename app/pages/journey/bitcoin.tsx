import { Link, Spacer, Text } from "@nextui-org/react";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";

const WhatIsBitcoinPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <Text>{"You've been tipped {999999999 sats} in bitcoin."}</Text>
      <NextLink href="https://bitcoin.org/bitcoin.pdf" passHref>
        <Link>What is bitcoin?</Link>
      </NextLink>
      <Spacer />
      <NextLink href={Routes.selectWallet} passHref>
        <Link>Choose a wallet</Link>
      </NextLink>

      <Spacer />
      <NextLink href={Routes.withdraw} passHref>
        <Link>I have a lightning wallet</Link>
      </NextLink>
    </>
  );
};

export default WhatIsBitcoinPage;
