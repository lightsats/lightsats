import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextImage } from "components/NextImage";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import React from "react";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

const slideImages = {
  digitalCash: "wallet.png",
  anytimeAnywhere: "map.png",
  beYourOwnBank: "vault.png",
  deflationary: "calculator.png",
  freedom: "heart.png",
  absoluteScarcity: "chart.png",
  bitcoinNotCrypto: "crown.png",
  renewableEnergy: "sun.png",
};

const WhatIsBitcoinPage: NextPage = () => {
  const { t } = useTranslation("journey");
  const slides: BitcoinSlideProps[] = React.useMemo(
    () =>
      Object.entries(slideImages).map((entry) => ({
        title: t(`bitcoin.${entry[0]}.title`),
        description: t(`bitcoin.${entry[0]}.description`),
        image: `/images/journey/${entry[1]}`,
      })),
    [t]
  );

  return (
    <>
      <Head>
        <title>Lightsats⚡ - Bitcoin</title>
      </Head>
      <MyBitcoinJourneyHeader />
      <MyBitcoinJourneyContent>
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination
          modules={[Pagination]}
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.title}>
              <>
                <BitcoinSlide {...slide} />
              </>
            </SwiperSlide>
          ))}
        </Swiper>

        <Spacer y={1} />
        <Card variant="flat">
          <Card.Body>
            <Grid.Container>
              <Grid xs={1}>
                <Icon>
                  <InformationCircleIcon />
                </Icon>
              </Grid>
              <Grid xs={10}>{t("bitcoin.needAWallet")}</Grid>
            </Grid.Container>
          </Card.Body>
        </Card>
      </MyBitcoinJourneyContent>
      <MyBitcoinJourneyFooter
        href={Routes.journeySelectWallet}
        text={<>Continue</>}
        nextUp="Download a wallet"
      />
    </>
  );
};

export default WhatIsBitcoinPage;

type BitcoinSlideProps = {
  title: string;
  description: string;
  image: string;
};

function BitcoinSlide({ title, description, image }: BitcoinSlideProps) {
  return (
    <>
      <Row justify="center">
        <NextImage
          alt={title}
          src={image}
          width={100}
          height={100}
          objectFit="contain"
        />
      </Row>
      <Spacer />
      <Text h3 style={{ width: "100%" }}>
        {title}
      </Text>
      <Text>{description}</Text>
      <Spacer y={2} />
    </>
  );
}

export { getStaticProps };
