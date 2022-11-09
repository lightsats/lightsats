import {
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Card,
  Grid,
  Image,
  Loading,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { Alert } from "components/Alert";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { NewTipButton } from "components/tipper/NewTipButton";
import { Tips } from "components/tipper/Tips";
import { UserCard } from "components/UserCard";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import ClaimedPage from "pages/journey/claimed";
import React from "react";
import CountUp from "react-countup";
import useSWR from "swr";
const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useUser();

  if (sessionStatus === "loading" || (session && !user)) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>

      {session && user ? (
        <>
          {user?.userType === "tipper" && (
            <>
              <Alert>⚠️ This project is currently in BETA.</Alert>
            </>
          )}
          <Spacer />
          {user?.userType === "tipper" ? (
            <>
              <UserCard userId={user.id} />
              <Spacer />
              <NewTipButton />
              <Spacer />
              <Tips />
            </>
          ) : (
            <TippeeHomepage />
          )}
        </>
      ) : (
        <>
          {/* <div style={{ border: "2px solid red", width: "100%" }}>test</div> */}
          <Spacer />
          {/* <Grid.Container gap={0}>
            <Grid xs={6}>
              <div>
                <Text
                  size={60}
                  h1
                  css={{
                    textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
                  }}
                >
                  Orange pill
                </Text>
                <Text h1 size={30} css={{ marginTop: "-0.5em" }}>
                  the world around you.
                </Text>
              </div>
            </Grid>
            <Grid xs={6}>
              <Image alt="" src="images/screenshot.png" width={200} />
            </Grid>
          </Grid.Container> */}
          <Image alt="" src="images/orange-pill.png" width={200} />
          <Text
            size={60}
            h1
            css={{
              textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
            }}
          >
            Orange pill
          </Text>
          <Text h1 size={30} css={{ marginTop: "-0.5em" }}>
            the world around you.
          </Text>
          <Spacer />
          <NextLink href={Routes.login} passHref>
            <a>
              <Button color="gradient" size="lg">
                Create your first tip &raquo;
              </Button>
            </a>
          </NextLink>
          <Spacer y={3} />

          <Grid.Container gap={3} sm={8}>
            <Grid sm={12} md={4}>
              <div style={{ textAlign: "center" }}>
                <Icon width={64} height={64}>
                  <ArrowTrendingUpIcon />
                </Icon>
                <Text h3>🚫💩🪙Bitcoin only</Text>
                <Text>
                  No shitcoins included. No shitcoins included. No shitcoins
                  included. No shitcoins included.
                </Text>
              </div>
            </Grid>
            <Grid sm={12} md={4}>
              <div style={{ textAlign: "center" }}>
                <Icon width={64} height={64}>
                  <AcademicCapIcon />
                </Icon>
                <Text h3>🍊💊 family and friends</Text>
                <Text>
                  Educational content, watch their progress, etc. help them get
                  started on their bitcoin journey.
                </Text>
              </div>
            </Grid>
            <Grid sm={12} md={4}>
              <div style={{ textAlign: "center" }}>
                <Icon width={64} height={64}>
                  <ArrowTrendingUpIcon />
                </Icon>
                <Text h3>🔨 PoW included</Text>
                <Text>
                  Your tipees have to go through proper onboarding and install
                  their own wallet to withdraw their tips.
                </Text>
              </div>
            </Grid>
          </Grid.Container>

          <Spacer y={5} />
          <div style={{ textAlign: "center" }}>
            <Text>Proof of work</Text>
            <Text
              h1
              size={120}
              css={{
                textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
              }}
            >
              <CountUp end={123456789} suffix=" SATS" duration={2}></CountUp>
            </Text>
            <Text h3>have been tipped to date.</Text>
          </div>

          <Spacer y={5} />

          <div style={{ textAlign: "center" }}>
            <Text h2>Make tipping fun again 👇</Text>
            <Spacer />
            <Text h4 css={{ textAlign: "center" }}>
              💰 Create a new tip and fund it
            </Text>
            <Card
              variant="flat"
              css={{
                background: "$gradient",
                color: "$white",
                width: "400px",
                height: "250px",
                maxWidth: "100%",
              }}
            >
              <Card.Body>
                <Grid.Container alignItems="center" justify="center">
                  <Grid xs={2}>
                    <Avatar />
                  </Grid>
                  <Grid xs={10}>
                    <Text b color="$white">
                      Satoshi Nakamoto
                    </Text>
                  </Grid>
                </Grid.Container>
                <Text
                  h1
                  size={64}
                  color="$white"
                  style={{
                    display: "flex",
                    alignSelf: "center",
                  }}
                >
                  $20.00
                </Text>
                <Button
                  flat
                  color="primary"
                  disabled
                  style={{ background: "$white", margin: "15px" }}
                >
                  Claim your tip
                </Button>
              </Card.Body>
            </Card>
          </div>

          <Spacer y={3} />

          <div style={{ textAlign: "center" }}>
            <Text h4 css={{ textAlign: "center" }}>
              🙌 Pass it on
            </Text>
            <Card
              variant="flat"
              css={{
                background: "$gradient",
                color: "$white",
                width: "460px",
                height: "250px",
              }}
            >
              <Card.Body>
                <Grid.Container alignItems="center" justify="center">
                  <Grid xs={2}>
                    <Avatar />
                  </Grid>
                  <Grid xs={10}>
                    <Text b color="$white">
                      Satoshi Nakamoto
                    </Text>
                  </Grid>
                </Grid.Container>
                <Text
                  h1
                  size={64}
                  color="$white"
                  style={{
                    display: "flex",
                    alignSelf: "center",
                  }}
                >
                  $20.00
                </Text>
                <Button
                  flat
                  color="primary"
                  disabled
                  style={{ background: "$white", margin: "15px" }}
                >
                  Claim your tip
                </Button>
              </Card.Body>
            </Card>
          </div>
          <Spacer y={3} />
          <div style={{ textAlign: "center" }}>
            <Text h4 css={{ textAlign: "center" }}>
              ✌️ Sats return to you
            </Text>
          </div>
        </>
      )}
    </>
  );
};

export default Home;

function TippeeHomepage() {
  const session = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? `/api/tippee/tips` : null,
    defaultFetcher
  );
  const claimedTips = React.useMemo(
    () =>
      tips?.filter((tip) => tip.status === "CLAIMED" && !hasTipExpired(tip)),
    [tips]
  );

  return claimedTips?.length ? (
    <ClaimedPage />
  ) : (
    <>
      <Text>{"It looks like you don't have any tips right now."}</Text>
    </>
  );
}
