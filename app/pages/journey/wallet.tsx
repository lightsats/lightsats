import { ItemsList } from "components/items/ItemsList";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";

const SelectWalletPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Choose a Wallet</title>
      </Head>
      <MyBitcoinJourneyHeader />

      <MyBitcoinJourneyContent>
        <ItemsList category="wallets" checkTippeeBalance />
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={Routes.withdraw}
        text={"Continue"}
        nextUp="Withdraw"
      />
    </>
  );
};

export default SelectWalletPage;
