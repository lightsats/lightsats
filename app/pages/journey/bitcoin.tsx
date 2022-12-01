import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Card, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextImage } from "components/NextImage";
import { MyBitcoinJourneyContent } from "components/tippee/MyBitcoinJourneyContent";
import { MyBitcoinJourneyFooter } from "components/tippee/MyBitcoinJourneyFooter";
import { MyBitcoinJourneyHeader } from "components/tippee/MyBitcoinJourneyHeader";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import { Pagination } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

const slides: BitcoinSlideProps[] = [
  {
    image: "/images/guide/bitcoin.png",
    title: "Bitcoin is Digital Cash",
    description:
      "Bitcoin is a digital currency that does not require any intermediary to send and receive from one person to another, just like buying a newspaper with cash.",
  },
  {
    image: "/images/guide/anytime-anywhere.jpg",
    title: "Anytime, Anywhere",
    description:
      "Bitcoin doesn't close on weekends. All you need is a computer or mobile phone to get started. Bitcoin lets you transact anywhere across the world.",
  },
  {
    image: "/images/guide/own-bank.png",
    title: "Be your Own Bank",
    description:
      "Take control of your money. No more big bank bailouts. No more fractional reserve banking. No personal questions or forms required.",
  },
  {
    image: "/images/guide/deflationary.png",
    title: "Bitcoin is Deflationary",
    description:
      "Bitcoin is a peaceful protest against irresponsible monetary policy and theft through the hidden tax of inflation. Bitcoin has a fixed policy since inception.",
  },
  {
    image: "/images/guide/peace.png",
    title: "Bitcoin is Freedom",
    description:
      "The alternative to Bitcoin is CBDCs. Your government will decide what you can spend your money on, and take it away from you if you don't spend it in time.",
  },
  {
    image: "/images/guide/infinity-over-21.webp",
    title: "Absolute Scarcity",
    description:
      "Bitcoin is the invention of absolute scarcity. We don't know how much gold there is in the universe. Bitcoin's maximum supply is capped at 21 million.",
  },
  {
    image: "/images/guide/bitcoin-not-crypto.png",
    title: 'Bitcoin is not "Crypto"',
    description:
      "Bitcoin has no marketing team. No premine. No VC fund. No monkey JPGs. Bitcoin's launch was as fair as possible, with no initial value in dollar terms.",
  },
  {
    image: "/images/guide/seed.png",
    title: "Pushing Renewable Energy",
    description:
      "Bitcoin miners use electricity in a race to mine Bitcoin, which also secures the network. Miners that find the cheapest electricity have an advantage.",
  },
];

const WhatIsBitcoinPage: NextPage = () => {
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
              <Grid xs={10}>
                {
                  "To withdraw your bitcoin, you'll first need a bitcoin wallet. Find out more in the next step."
                }
              </Grid>
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
          width={250}
          height={250}
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
