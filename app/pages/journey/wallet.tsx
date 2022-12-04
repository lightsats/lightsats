import { Spacer, Text } from "@nextui-org/react";
import { ItemsList } from "components/items/ItemsList";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { useReceivedTips } from "hooks/useTips";
import { getStaticProps } from "lib/i18n/i18next";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const SelectWalletPage: NextPage = () => {
  const { data: tips } = useReceivedTips();
  const receivedTips = React.useMemo(
    () =>
      tips?.filter(
        (tip) => tip.status === "CLAIMED" || tip.status === "WITHDRAWN"
      ),
    [tips]
  );

  const categoryFilterOptions: CategoryFilterOptions = React.useMemo(
    () => ({
      checkTippeeBalance: true,
      tippeeBalance: receivedTips?.length
        ? receivedTips.map((tip) => tip.amount).reduce((a, b) => a + b)
        : 0,
      recommendedLimit: 1,
    }),
    [receivedTips]
  );

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Choose a Wallet</title>
      </Head>
      <MyBitcoinJourneyHeader />

      <MyBitcoinJourneyContent>
        <Text>
          {
            "You need to download a wallet in order to self custody your bitcoin."
          }
        </Text>
        <Spacer />
        <Text>
          {
            "Self custody of bitcoin is like keeping your own house keys. Having the keys gives you direct access and control to your property and helps ensure that no one else can enter or access it without your permission."
          }
        </Text>
        <Spacer />
        <ItemsList category="wallets" options={categoryFilterOptions} />
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

export { getStaticProps };
