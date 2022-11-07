import { Button, Image, Loading, Spacer, Text } from "@nextui-org/react";
import { Tip, User } from "@prisma/client";
import { Alert } from "components/Alert";
import { NextLink } from "components/NextLink";
import { NewTipButton } from "components/tipper/NewTipButton";
import { Tips } from "components/tipper/Tips";
import { Routes } from "lib/Routes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import ClaimedPage from "pages/journey/claimed";
import React from "react";
import useSWR from "swr";

const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const { data: user } = useSWR<User>(
    session ? `/api/users/${session.user.id}` : null,
    defaultFetcher
  );

  if (sessionStatus === "loading" || (session && !user)) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>

      {session && user ? (
        <>
          {user?.userType === "tipper" ? (
            <>
              <Alert>
                ⚠️ This project is currently in BETA, don&apos;t be too
                reckless.
              </Alert>
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
          <Spacer />
          <Image alt="" src="images/seed.png" width={200} />
          <Text
            size={60}
            h1
            css={{
              textGradient: "45deg, $blue900 -20%, $blue600 50%",
            }}
          >
            Orange pill
          </Text>
          <Text h1 size={30} css={{ marginTop: "-0.5em" }}>
            the world around you.
          </Text>
          <Spacer />
          <NextLink href={Routes.signup}>
            <a>
              <Button size="lg">Get started &raquo;</Button>
            </a>
          </NextLink>
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
    () => tips?.filter((tip) => tip.status === "CLAIMED"),
    [tips]
  );

  return claimedTips?.length ? (
    <ClaimedPage />
  ) : (
    <>
      <Text>{"It looks like you don't have any gifts right now."}</Text>
    </>
  );
}
