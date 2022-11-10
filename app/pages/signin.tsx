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
      <h2>Sign in</h2>
      <p>Choose your preferred way to sign in to Lightsats.</p>
      <Spacer />
      <Login />
    </>
  );
};

export default SignInPage;

export { getStaticProps };
