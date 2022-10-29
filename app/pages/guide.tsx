import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Button, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";
import NextLink from "next/link";
import { Guide } from "types/Guide";

const guides: Guide[] = [
  {
    name: "Spend",
    description: "Purchase gift cards, pre-paid visa cards, pay bills",
    icon: <BanknotesIcon />,
    link: Routes.guideSpend,
  },
  {
    name: "Earn",
    description: "Ways to earn extra Bitcoin",
    icon: <BanknotesIcon />,
    link: Routes.guideEarn,
  },
  {
    name: "Buy",
    description: "Buy Bitcoin from trusted exchanges",
    icon: <BanknotesIcon />,
    link: Routes.guideBuy,
  },
  {
    name: "Save",
    description: "Safely Saving Your Bitcoin",
    icon: <BanknotesIcon />,
    link: Routes.guideSpend,
  },
  {
    name: "Send",
    description: "Send Bitcoin to a loved one",
    icon: <BanknotesIcon />,
    link: Routes.guideSend,
  },
  {
    name: "Donate",
    description: "Donate Bitcoin to someone in need",
    icon: <BanknotesIcon />,
    link: Routes.guideDonate,
  },
  {
    name: "Learn",
    description:
      'Learn more about Bitcoin and why "Bitcoin Fixes This" - Philosophy, Engineering, Economics, Politics, History...',
    icon: <BanknotesIcon />,
    link: Routes.guideLearn,
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
        <a target="_blank" style={{ width: "100%" }}>
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
