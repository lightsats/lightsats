import { Link, Row, Spacer, Text } from "@nextui-org/react";
import { ConfettiContainer } from "components/ConfettiContainer";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { usePublicTip } from "hooks/usePublicTip";
import { getStaticProps } from "lib/i18n/i18next";

import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";

const CongratulationsPage: NextPage = () => {
  const { t } = useTranslation("journey");
  const router = useRouter();
  const tipId = router.query["tipId"];
  const { data: publicTip } = usePublicTip(tipId as string);

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
        {publicTip?.advertisementUrl && publicTip?.advertisementImageUrl && (
          <>
            <Spacer y={2} />
            <Row justify="center">
              <Text color="gray" small>
                Sponsored by
              </Text>
            </Row>
            <Spacer y={0.5} />
            <Row justify="center">
              <Link href={publicTip.advertisementUrl} target="_blank">
                {/* eslint-disable-next-line @next/next/no-img-element*/}
                <img
                  alt="Advertisement Image"
                  style={{ width: "100%", height: "auto" }}
                  src={publicTip.advertisementImageUrl}
                />
              </Link>
            </Row>
          </>
        )}
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={PageRoutes.guide}
        text={t("congratulations.footer.text")}
        nextUp={t("congratulations.footer.cta")}
      />
    </>
  );
};

export default CongratulationsPage;

export { getStaticProps };
