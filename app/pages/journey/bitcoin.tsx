import { Spacer, Text } from "@nextui-org/react";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";

const WhatIsBitcoinPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <MyBitcoinJourneyContent>
        <Text>
          {
            "Bitcoin is a digital currency that does not require any intermediary to send and receive from one person to another."
          }
        </Text>
        <Spacer />
        <Text>
          {
            "Just like you recieved this tip from someone digitally, it never went through a bank or any entity."
          }
        </Text>
        <Spacer y={3} />
        <Text>{"You'll need a Bitcoin wallet to withdraw your tip."}</Text>
      </MyBitcoinJourneyContent>

      <MyBitcoinJourneyFooter
        href={Routes.journeySelectWallet}
        text={<>Bitcoin Wallet?</>}
      />
    </>
  );
};

export default WhatIsBitcoinPage;
