import { Button, Image, Link, Loading, Spacer, Text } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { NextLink } from "components/NextLink";
import { NewTipButton } from "components/tipper/NewTipButton";
import { Tips } from "components/tipper/Tips";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";

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
          <Alert>
            ⚠️ This project is currently in BETA, don&apos;t be too reckless.
          </Alert>
          <Spacer />
          <NewTipButton />
          <Spacer />
          <Tips />
          <Spacer y={4} />
          <Text>Received a gift?</Text>
          <NextLink href={Routes.withdraw} passHref>
            <Link>withdraw claimed gifts</Link>
          </NextLink>
        </>
      ) : (
        <>
          <Spacer />
          <Image src="images/seed.png" width={200} />
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
