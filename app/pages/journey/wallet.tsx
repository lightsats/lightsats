import { Link, Spacer, Text } from "@nextui-org/react";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";

const SelectWalletPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Choose a Wallet</title>
      </Head>
      <Text>{"You'll need a lightning wallet to withdraw your tip."}</Text>
      <NextLink href="https://lightning.network" passHref>
        <Link>What is lightning?</Link>
      </NextLink>
      <h4>Recommended Wallets</h4>
      <NextLink href="https://www.walletofsatoshi.com/" passHref>
        <Link>Wallet of satoshi</Link>
      </NextLink>

      <Spacer />
      <NextLink href={Routes.withdraw} passHref>
        <Link>I have a lightning wallet</Link>
      </NextLink>
    </>
  );
};

export default SelectWalletPage;
