import { Button, Container, Link, Spacer, Text } from "@nextui-org/react";
import { NewTipButton } from "components/tipper/NewTipButton";
import { Tips } from "components/tipper/Tips";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import NextLink from "next/link";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Lightsats⚡</title>
      </Head>

      {session ? (
        <>
          <Container
            justify="center"
            alignItems="center"
            display="flex"
            gap={4}
          >
            <Text small>Signed in as {session.user.email}</Text>
            &nbsp;
            <Button size="xs" onClick={() => signOut()}>
              Sign out
            </Button>
          </Container>
          <Spacer y={2} />
          <NewTipButton />
          <Spacer />
          <Tips />
          <Spacer y={4} />
          <Text>Received a gift?</Text>
          <NextLink href={Routes.withdraw}>
            <a>
              <Link color="success">withdraw claimed gifts</Link>
            </a>
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
          <Button onClick={() => signIn()}>Sign in</Button>
        </>
      )}
    </>
  );
};

export default Home;
