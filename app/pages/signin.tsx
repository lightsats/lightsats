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
      <Login></Login>
    </>
  );
};

export default SignInPage;

export { getStaticProps };
