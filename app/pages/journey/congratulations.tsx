import { Spacer, Text } from "@nextui-org/react";
import { ConfettiContainer } from "components/ConfettiContainer";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { getStaticProps } from "lib/i18n/i18next";

import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

const CongratulationsPage: NextPage = () => {
  const { t } = useTranslation("journey");
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Congratulations</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <ConfettiContainer />
      <MyBitcoinJourneyContent>
        <h2>{t("congratulations.title")}</h2>
        <Spacer />
        <Text>{t("congratulations.subtitle")}</Text>
        <Text blockquote>{t("congratulations.quote")}</Text>
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={Routes.guide}
        text={t("congratulations.footer.text")}
        nextUp={t("congratulations.footer.cta")}
      />
    </>
  );
};

export default CongratulationsPage;

export { getStaticProps };
