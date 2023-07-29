import { Button, Card, Col, Grid, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { useGuides } from "hooks/useGuides";
import { getStaticProps } from "lib/i18n/i18next";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { Guide } from "types/Guide";

const GuidePage: NextPage = () => {
  const { t } = useTranslation("guide");
  const guides = useGuides();
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Guide</title>
      </Head>
      <Text h3>{t("title")}</Text>
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

export { getStaticProps };
