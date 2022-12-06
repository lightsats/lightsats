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
    image: "/images/journey/wallet.png",
    title: "Bitcoin is Digital Cash",
    description:
      "Bitcoin is a digital currency that lets you send money directly to another person without using a bank or other intermediary. It's like using cash to buy a newspaper.",
  },
  {
    image: "/images/journey/map.png",
    title: "Anytime, Anywhere",
    description:
      "Bitcoin doesn't close on weekends. All you need is a computer or mobile phone to get started. Bitcoin lets you transact anywhere across the world.",
  },
  {
    image: "/images/journey/vault.png",
    title: "Be your Own Bank",
    description:
      "Take control of your money with Bitcoin. Say goodbye to big bank bailouts and fractional reserve banking. And forget about personal questions and forms - with Bitcoin, you can transact quickly and easily.",
  },
  {
    image: "/images/journey/calculator.png",
    title: "Bitcoin is Deflationary",
    description:
      "Bitcoin lets you take control of your money and protect it from unfair policies and inflation. With a fixed supply, it's a stable alternative to regular currencies.",
  },
  {
    image: "/images/journey/heart.png",
    title: "Bitcoin is Freedom",
    description:
      "The alternative to Bitcoin is government-controlled digital currencies, or CBDCs. With these, your government can decide how and when you can spend your money, and even take it away from you if you don't use it fast enough.",
  },
  {
    image: "/images/journey/chart.png",
    title: "Absolute Scarcity",
    description:
      "Bitcoin is the only currency with a fixed, finite supply. Unlike gold, which we don't know how much exists, the maximum amount of Bitcoin is capped at 21 million. This makes it the ultimate scarce asset.",
  },
  {
    image: "/images/journey/crown.png",
    title: 'Bitcoin is not "Crypto"',
    description:
      "Bitcoin has no marketing team, no premine, and no venture capital backing. It was launched as fairly as possible, with no initial value in dollars. There is no second best.",
  },
  {
    image: "/images/journey/sun.png",
    title: "Pushing Renewable Energy",
    description:
      "Bitcoin miners use electricity to compete and earn new bitcoins, helping to keep the network secure. Cheap, renewable electricity gives miners an advantage and makes the grid more stable.",
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
