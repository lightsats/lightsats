import { Button, Container, Link, Spacer, Text } from "@nextui-org/react";
import type { NextPage } from "next";
import { useSession, signOut, signIn } from "next-auth/react";
import Head from "next/head";
import { NewTipButton } from "../components/tipper/NewTipButton";
import { Tips } from "../components/tipper/Tips";
import NextLink from "next/link";
import { Routes } from "../lib/Routes";

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
            Signed in as {session.user.email}
            &nbsp;
            <Button size="xs" onClick={() => signOut()}>
              Sign out
            </Button>
          </Container>
          <Spacer />
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
