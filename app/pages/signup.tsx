import { Spacer } from "@nextui-org/react";
import { Login } from "components/Login";
import { t } from "i18next";
import type { NextPage } from "next";
import Head from "next/head";

const SignupPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Sign up</title>
      </Head>
      <h2>Sign up</h2>
      <p>Choose your preferred way to sign up for Lightsats.</p>
      <Spacer />
      <Login submitText={t("common:signup")}></Login>
    </>
  );
};

export default SignupPage;
