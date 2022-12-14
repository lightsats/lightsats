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
import { Button, Card, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import Head from "next/head";
import { Guide } from "types/Guide";

export const guides: Guide[] = [
  {
    name: "Spend ๐",
    description:
      "Spend at stores accepting Bitcoin, purchase gift cards, pre-paid visa cards, pay bills",
    shortDescription: "Spend at stores accepting Bitcoin",
    icon: <CreditCardIcon />,
    link: PageRoutes.guideSpend,
  },
  {
    name: "Earn ๐ค",
    description: "Earn extra Bitcoin",
    icon: <BanknotesIcon />,
    link: PageRoutes.guideEarn,
  },
  {
    name: "Buy ๐ฝ",
    description: "Buy Bitcoin from trusted exchanges",
    icon: <CurrencyDollarIcon />,
    link: PageRoutes.guideBuy,
  },
  {
    name: "Save ๐ฆ",
    description: "How to safely store your Bitcoin long-term",
    icon: <CircleStackIcon />,
    link: PageRoutes.guideSave,
  },
  {
    name: "Send โ๏ธ",
    description: "Send Bitcoin to a loved one",
    icon: <PaperAirplaneIcon />,
    link: PageRoutes.guideSend,
  },
  {
    name: "Tip ๐๐ฝโโ๏ธ",
    description: "Send a tip directly or onboard a new user with Lightsats!",
    icon: <GiftIcon />,
    link: PageRoutes.guideTip,
  },
  {
    name: "Donate ๐งก",
    description: "Donate Bitcoin to someone in need",
    icon: <HeartIcon />,
    link: PageRoutes.guideDonate,
  },
  {
    name: "Learn ๐",
    description:
      'Learn more about Bitcoin and why "Bitcoin Fixes This" - Philosophy, Engineering, Economics, Politics, History...',
    shortDescription: "Learn more about Bitcoin and Lightning",
    icon: <BookOpenIcon />,
    link: PageRoutes.guideLearn,
  },
  {
    name: "Wallets ๐",
    description: "View recommended Lightning wallets",
    icon: <WalletIcon />,
    link: PageRoutes.guideWallets,
  },
];

const GuidePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsatsโก - Guide</title>
      </Head>
      <Text h3>What would you like to do with your Bitcoin?</Text>
      <Spacer />
      <Grid.Container gap={1}>
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
    <NextLink href={guide.link}>
      <a style={{ width: "100%" }}>
        <Grid css={{ size: "100%" }}>
          <Card isHoverable isPressable css={{ dropShadow: "$sm" }}>
            <Card.Body>
              <Row align="center">
                <Spacer x={0.33} />
                <Button color="primary" auto flat css={{ px: 18 }} size="xl">
                  <Icon>{guide.icon}</Icon>
                </Button>
                <Spacer x={1} />
                <Col>
                  <Text b>{guide.name}</Text>
                  <Text color="$gray700" css={{ lh: "$sm", mt: 0 }}>
                    {guide.description}
                  </Text>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Grid>
      </a>
    </NextLink>
  );
}
