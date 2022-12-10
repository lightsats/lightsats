import { Grid, Link, Row, Spacer, Text } from "@nextui-org/react";
import type { NextPage } from "next";
import Head from "next/head";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - About</title>
      </Head>
      <h2>About</h2>
      <iframe
        width="100%"
        height="500px"
        src="https://www.youtube.com/embed/hX58ynrSNW8"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <Spacer />
      <h3>For Recipients</h3>
      <Row>
        <Text>
          The easiest way to recieve Bitcoin. Lightsats will take you on a
          simple and rewarding journey to safely withdraw your Bitcoin to a
          wallet of your choice, and then show all the ways you can use it.
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Text>Want to spend it? Save it? Buy? Earn more? We got you!</Text>
      </Row>
      <Spacer />
      <h3>For Tippers</h3>
      <Row>
        <Text>
          Bitcoiners can now finally tip/gift sats without worrying about
          onboarding the user and also losing their sats.
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Text>
          We will first educate your recipient to download a Lightning Wallet
          and take them through a full series of user journeys where they can
          experience firsthand the capabilities of Bitcoin and the Lightning
          Network.
        </Text>
      </Row>
      <Spacer />
      <Row>
        <Text>
          If your recipient {"doesn't"} withdraw their tip in time, you can
          reclaim your sats!
        </Text>
      </Row>
      <Spacer />
      <Text h3>Credits</Text>
      <Row>
        <Text>
          - See our{" "}
          <Link
            href="https://github.com/lightsats/lightsats"
            css={{ display: "inline" }}
          >
            github contributors
          </Link>
        </Text>
      </Row>
      <Row>
        <Text>
          - Special thanks to Ed from BOLT FUN for guidance and help with
          design/UX
        </Text>
      </Row>
      <Row>
        <Text>
          - Thank you to all our Twitter followers who shared Lightsats
        </Text>
      </Row>
      <Row>
        <Text>
          - Thank you to the plebs who are pushing Bitcoin adoption forward and
          orange pilling their friends, family and local businesses.
        </Text>
      </Row>
      <Row>
        <Text>
          - 3d icons by{" "}
          <Link href="https://vijayverma.co/" css={{ display: "inline" }}>
            realvjy
          </Link>
        </Text>
      </Row>
      <Row>
        <Text>
          - christmas PNG Designed By Kerfin7 from{" "}
          <a href="https://pngtree.com"> Pngtree.com</a>
        </Text>
      </Row>
      <Spacer />
      <h3>Links</h3>
      <Grid.Container gap={1} justify="center">
        <Grid>
          <Link href="https://github.com/lightsats/lightsats" target="_blank">
            Github
          </Link>
        </Grid>
        <Grid>
          <Link href="https://twitter.com/lightsats21" target="_blank">
            Twitter
          </Link>
        </Grid>
      </Grid.Container>
    </>
  );
};

export default AboutPage;
