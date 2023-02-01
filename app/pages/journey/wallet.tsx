import { Loading, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { ItemsList } from "components/items/ItemsList";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { useReceivedTips } from "hooks/useTips";
import { getStaticProps } from "lib/i18n/i18next";
import { CategoryFilterOptions } from "lib/items/getRecommendedItems";
import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import React from "react";
import { PublicTip } from "types/PublicTip";

type SelectWalletPageContentProps = {
  receivedTips: (PublicTip | Tip)[];
  nextUp?: string;
  href?: string;
  lnurlAuthCapable?: boolean;
  goToNextPage?(): void;
};

export function SelectWalletPageContent({
  receivedTips,
  nextUp,
  href,
  lnurlAuthCapable,
}: SelectWalletPageContentProps) {
  const categoryFilterOptions: CategoryFilterOptions = React.useMemo(
    () => ({
      checkTippeeBalance: true,
      tippeeBalance: receivedTips?.length
        ? receivedTips.map((tip) => tip.amount).reduce((a, b) => a + b)
        : 0,
      recommendedLimit: 1,
      recommendedItemId: receivedTips?.[0]?.recommendedWalletId ?? undefined,
      lnurlAuthCapable,
      filterOtherItems: true,
    }),
    [lnurlAuthCapable, receivedTips]
  );

  const { t } = useTranslation("journey");

  return (
    <>
      <MyBitcoinJourneyContent>
        <Text>{t("wallet.needAWallet")}</Text>
        <Spacer />
        <Text>{t("wallet.selfCustody")}</Text>
        <Spacer />
        <ItemsList category="wallets" options={categoryFilterOptions} />
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={href || PageRoutes.withdraw}
        text={t("wallet.footer.text")}
        nextUp={nextUp || t("wallet.footer.cta")}
      />
    </>
  );
}

const SelectWalletPage: NextPage = () => {
  const { data: tips } = useReceivedTips();
  const receivedTips = React.useMemo(
    () =>
      tips?.filter(
        (tip) => tip.status === "CLAIMED" || tip.status === "WITHDRAWN"
      ),
    [tips]
  );

  if (!receivedTips) {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Choose a Wallet</title>
      </Head>
      <MyBitcoinJourneyHeader />

      <SelectWalletPageContent receivedTips={receivedTips} />
    </>
  );
};

export default SelectWalletPage;

export { getStaticProps };
