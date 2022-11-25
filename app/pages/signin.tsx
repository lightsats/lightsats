import { Spacer } from "@nextui-org/react";
import { Login } from "components/Login";
import { getStaticProps } from "lib/i18n/i18next";
import type { NextPage } from "next";
import Head from "next/head";

const SignInPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Sign in</title>
      </Head>
      <h2>Welcome! 👋</h2>
      <p>Please choose your preferred way to sign in.</p>
      <Spacer y={1.5} />
      <Login defaultLoginMethod="lightning" />
    </>
  );
};

export default SignInPage;

export { getStaticProps };
