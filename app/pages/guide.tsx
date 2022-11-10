import {
  BanknotesIcon,
  BookOpenIcon,
  CircleStackIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  GiftIcon,
  HeartIcon,
  PaperAirplaneIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { Button, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import { Guide } from "types/Guide";

const guides: Guide[] = [
  {
    name: "Spend 🛒 ",
    description:
      "Spend at stores accepting Bitcoin, purchase gift cards, pre-paid visa cards, pay bills",
    icon: <CreditCardIcon />,
    link: Routes.guideSpend,
  },
  {
    name: "Earn 🤑",
    description: "Earn extra Bitcoin",
    icon: <BanknotesIcon />,
    link: Routes.guideEarn,
  },
  {
    name: "Buy 🌽",
    description: "Buy Bitcoin from trusted exchanges",
    icon: <CurrencyDollarIcon />,
    link: Routes.guideBuy,
  },
  {
    name: "Save 🛟",
    description: "How to safely store your Bitcoin long-term",
    icon: <CircleStackIcon />,
    link: Routes.guideSave,
  },
  {
    name: "Send ↗️",
    description: "Send Bitcoin to a loved one",
    icon: <PaperAirplaneIcon />,
    link: Routes.guideSend,
  },
  {
    name: "Tip 💁🏽‍♀️",
    description: "Send a tip directly or onboard a new user with Lightsats!",
    icon: <GiftIcon />,
    link: Routes.guideTip,
  },
  {
    name: "Donate 🧡",
    description: "Donate Bitcoin to someone in need",
    icon: <HeartIcon />,
    link: Routes.guideDonate,
  },
  {
    name: "Learn 📙",
    description:
      'Learn more about Bitcoin and why "Bitcoin Fixes This" - Philosophy, Engineering, Economics, Politics, History...',
    icon: <BookOpenIcon />,
    link: Routes.guideLearn,
  },
  {
    name: "Wallets 👛",
    description: "View recommended Lightning wallets",
    icon: <WalletIcon />,
    link: Routes.guideWallets,
  },
];

const GuidePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Guide</title>
      </Head>
      <Text>What would you like to do with your Bitcoin?</Text>
      <Spacer />
      <Grid.Container gap={2} justify="center">
        {guides.map((guide) => (
          <GuideCard key={guide.name} guide={guide} />
        ))}
      </Grid.Container>
    </>
  );
};

export default GuidePage;

type GuideCardProps = {
  guide: Guide;
};

function GuideCard({ guide }: GuideCardProps) {
  return (
    <Grid xs={12} justify="center" css={{ px: 0 }}>
      <NextLink href={guide.link}>
        <a style={{ width: "100%" }}>
          <Row align="center" style={{ height: "100%" }}>
            <Col span={2.5}>
              <Row justify="flex-start">
                <Button
                  color="primary"
                  auto
                  flat
                  icon={<Icon>{guide.icon}</Icon>}
                />
              </Row>
            </Col>
            <Col>
              <Row>
                <Text b>{guide.name}</Text>
              </Row>
              <Row>
                <Text color="gray" size="small">
                  {guide.description}
                </Text>
              </Row>
            </Col>
          </Row>
        </a>
      </NextLink>
    </Grid>
  );
}
