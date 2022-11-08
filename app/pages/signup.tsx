import { Button, Link, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import Head from "next/head";

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Sign up</title>
      </Head>
      <h2>Sign up</h2>
      <p>Choose your preferred way to sign up for Lightsats.</p>
      <Spacer />
      <NextLink href={Routes.emailSignin}>
        <a>
          <Button>📧 Email</Button>
        </a>
      </NextLink>
      <Text>or</Text>
      <NextLink href={Routes.lnurlAuthSignin} passHref>
        <Link>
          <Button>⚡ Lightning</Button>
        </Link>
      </NextLink>
      <Spacer />
      Already have an account?
      <NextLink href={Routes.login} passHref>
        <Link>Sign in</Link>
      </NextLink>
    </>
  );
};

export default AboutPage;
