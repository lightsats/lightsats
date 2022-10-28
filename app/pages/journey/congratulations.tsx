import { Link, Spacer, Text } from "@nextui-org/react";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";

const CongratulationsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Congratulations</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <Text>{"Woohoo! you've withdrawn your bitcoin!"}</Text>

      <Spacer />
      <NextLink href={Routes.journeyNextSteps} passHref>
        <Link>What can I do with my Bitcoin?</Link>
      </NextLink>
    </>
  );
};

export default CongratulationsPage;
