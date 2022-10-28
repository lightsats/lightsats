import { Button, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { NewTipButton } from "components/tipper/NewTipButton";
import { Tips } from "components/tipper/Tips";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import NextLink from "next/link";

const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus === "loading") {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>

      {session ? (
        <>
          <Text color="error" size="small" b>
            BETA - PLEASE ONLY TIP AMOUNTS YOU ARE WILLING TO LOSE!
          </Text>
          <Spacer y={1} />
          <NewTipButton />
          <Spacer />
          <Tips />
          <Spacer y={4} />
          <Text>Received a gift?</Text>
          <NextLink href={Routes.withdraw} passHref>
            <Link color="success">withdraw claimed gifts</Link>
          </NextLink>
        </>
      ) : (
        <>
          <Spacer />
          <Text h3>
            Gift Sats without
            <br />
            losing them✌🏼
          </Text>
          <Spacer />
          <NextLink href={Routes.lnurlAuthSignin}>
            <a>
              <Button>Login with LNURL⚡</Button>
            </a>
          </NextLink>
          {<Spacer />}
          <NextLink href={Routes.emailSignin}>
            <a>
              <Button>Login with Email</Button>
            </a>
          </NextLink>
        </>
      )}
    </>
  );
};

export default Home;
