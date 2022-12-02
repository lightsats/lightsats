import {
  Avatar,
  Button,
  Card,
  Grid,
  Loading,
  Spacer,
  Text,
} from "@nextui-org/react";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import React, { useRef } from "react";
import { useInViewport } from "react-in-viewport";
import { Tweet } from "react-twitter-widgets";
import useSWR from "swr";
import { Scoreboard as ScoreboardType } from "types/Scoreboard";
import { CountUp } from "use-count-up";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>
      <Homepage />
    </>
  );
};

export default Home;

function HomepageCTA() {
  const { status: sessionStatus } = useSession();
  return (
    <NextLink
      href={sessionStatus === "authenticated" ? Routes.dashboard : Routes.login}
      passHref
    >
      <a>
        <Button color="primary" size="lg">
          {sessionStatus === "authenticated" ? (
            <>Open dashboard</>
          ) : sessionStatus === "unauthenticated" ? (
            <>Create your first tip &raquo;</>
          ) : (
            ""
          )}
        </Button>
      </a>
    </NextLink>
  );
}

function Homepage() {
  const { data: scoreboard } = useSWR<ScoreboardType>(
    `/api/scoreboard`,
    defaultFetcher
  );
  const [pageLoaded, setPageLoaded] = React.useState(false);

  React.useEffect(() => {
    const onPageLoad = () => {
      setPageLoaded(true);
    };

    if (document.readyState === "complete") {
      onPageLoad();
    } else {
      window.addEventListener("load", onPageLoad);
      return () => window.removeEventListener("load", onPageLoad);
    }
  }, []);

  if (!scoreboard) {
    return <Loading color="currentColor" size="lg" />;
  }

  return (
    <>
      <Spacer />
      <NextImage
        alt=""
        src="/images/orange-pill.png"
        width={250}
        height={250}
      />
      <Spacer />
      <Text
        h1
        css={{
          textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        Orange pill the world around you.
      </Text>
      <Text h1 size="$4xl">
        One tip at a time.
      </Text>
      <Spacer />
      <HomepageCTA />
      <Spacer y={5} />
      <Grid.Container sm={10} justify="center">
        <Card>
          <Card.Body>
            <Grid.Container gap={2}>
              <Grid
                sm={12}
                md={4}
                css={{
                  fg: 1,
                  jc: "flex-start",
                  ai: "center",
                  flexDirection: "column",
                  ta: "center",
                }}
              >
                <NextImage
                  alt=""
                  src="/images/gift.png"
                  width={128}
                  height={128}
                />
                <Text h3>Gift sats without losing them</Text>
                <Text color="$gray700">
                  {
                    "If your tippee doesn't claim their tip, those precious sats return to you."
                  }
                </Text>
              </Grid>
              <Grid
                sm={12}
                md={4}
                css={{
                  jc: "flex-start",
                  ai: "center",
                  flexDirection: "column",
                  ta: "center",
                  fg: 1,
                }}
              >
                <NextImage
                  alt=""
                  src="/images/flag.png"
                  width={128}
                  height={128}
                />
                <Text h3>Progress tracker</Text>
                <Text color="$gray700">
                  Follow your tippees along their journey into the rabbit hole.
                  Be there for them when they have questions.
                </Text>
              </Grid>
              <Grid
                sm={12}
                md={4}
                css={{
                  jc: "flex-start",
                  ai: "center",
                  flexDirection: "column",
                  ta: "center",
                  fg: 1,
                }}
              >
                <NextImage
                  alt=""
                  src="/images/onboarding.png"
                  width={128}
                  height={128}
                />
                <Text h3>Onboarding is on us</Text>
                <Text color="$gray700">
                  Have your tippees go through proper onboarding and install
                  their own wallet to withdraw their tips.
                </Text>
              </Grid>
            </Grid.Container>
          </Card.Body>
        </Card>
      </Grid.Container>
      <Spacer y={5} />
      <TipCounter totalSatsSent={scoreboard.totalSatsSent} />
      <Spacer y={5} />
      <Text h3 style={{ textAlign: "center" }}>
        🧡 What others have to say about us
      </Text>
      {pageLoaded && (
        <Grid.Container gap={2} sm={12} justify="center" alignContent="center">
          <Grid xs={12} sm={4}>
            <div style={{ width: "100%" }}>
              <Tweet tweetId="1594009088421085185" />
            </div>
          </Grid>
          <Grid xs={12} sm={4}>
            <div style={{ width: "100%" }}>
              <Tweet tweetId="1591901975649869824" />
            </div>
          </Grid>
          <Grid xs={12} sm={4}>
            <div style={{ width: "100%" }}>
              <Tweet tweetId="1590860149471973376" />
            </div>
          </Grid>
        </Grid.Container>
      )}
      <Spacer y={5} />
      <Text
        h1
        size="$8xl"
        css={{
          textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
          lineHeight: 1.2,
          textAlign: "center",
        }}
      >
        Join the tipping battle
      </Text>
      <Spacer />
      <Avatar.Group count={scoreboard.numTippers - 3}>
        <Avatar
          size="xl"
          text="name"
          stacked
          src="https://pbs.twimg.com/profile_images/558632546398134274/LpoJ5y4L_400x400.jpeg"
        />
        <Avatar
          size="xl"
          text="name"
          stacked
          src="https://secure.gravatar.com/avatar/07e22939e7672b38c56615068c4c715f?size=200&default=mm&rating=g"
        />
        <Avatar
          size="xl"
          text="name"
          stacked
          src="https://pbs.twimg.com/profile_images/1476767205689724932/NZUSZUTd_400x400.jpg"
        />
      </Avatar.Group>
      <Spacer y={0.25} />
      <Text style={{ textAlign: "center" }}>
        Join{" "}
        <a
          href="https://lightsats.com/users/cl9q2861o0015grf6z64ls8mj"
          target="_blank"
          rel="noopener noreferrer"
        >
          Juan
        </a>
        ,{" "}
        <a
          href="https://lightsats.com/users/cl9milvij0003j9f6eseeugra"
          target="_blank"
          rel="noopener noreferrer"
        >
          René
        </a>
        ,{" "}
        <a
          href="https://lightsats.com/users/cl9gmxceu0000fjf67ozj59n5"
          target="_blank"
          rel="noopener noreferrer"
        >
          Roland
        </a>{" "}
        &{" "}
        <NextLink href={Routes.scoreboard}>
          <a>{scoreboard.numTippers - 3} others</a>
        </NextLink>{" "}
        to 🍊💊 the world around you.
      </Text>
      <Spacer y={2} />
      <HomepageCTA />
      <Spacer y={5} />
      <Text h3 style={{ textAlign: "center" }}>
        Learn More
      </Text>
      <Text css={{ maxWidth: "500px", textAlign: "center" }}>
        This project is being built during the &nbsp;
        <a href="https://makers.bolt.fun/tournaments/1/overview">🔩 BOLT.FUN</a>
        &nbsp;&raquo;Legends of Lightning&laquo; tournament. Check out our&nbsp;
        <a href="https://makers.bolt.fun/project/Lightsats">project page</a> to
        see our pitch and to learn more about the product and the team behind
        it.
      </Text>
      <Spacer />
      <NextLink href={Routes.about} passHref>
        <a>
          <Button color="primary" size="lg">
            About
          </Button>
        </a>
      </NextLink>
      <Spacer y={4} />
    </>
  );
}

function TipCounter({ totalSatsSent }: { totalSatsSent: number }) {
  const myRef = useRef<HTMLElement>(null);
  const { inViewport } = useInViewport(myRef, {}, { disconnectOnLeave: false });

  return (
    <div style={{ textAlign: "center" }}>
      <Text h3>With Lightsats</Text>
      <Spacer y={0.5} />
      <Text
        b
        ref={myRef}
        css={{
          textGradient: "45deg, #ff9400 -20%, #ffcf00 50%",
          lineHeight: "$xs",
          mt: -10,
          fontSize: "$4xl",
          "@lg": {
            fontSize: "$8xl",
          },
        }}
      >
        {inViewport ? (
          <CountUp
            isCounting
            end={totalSatsSent}
            easing={"easeOutCubic"}
            duration={2}
            thousandsSeparator=","
          />
        ) : (
          0
        )}
        &nbsp;sats
      </Text>
      <Spacer />
      <Text h3>have been tipped to date.</Text>
    </div>
  );
}
