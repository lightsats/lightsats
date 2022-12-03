import { Spacer } from "@nextui-org/react";
import { Login } from "components/Login";
import { getStaticProps } from "lib/i18n/i18next";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";

const SignInPage: NextPage = () => {
  const { t } = useTranslation("login");
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Sign in</title>
      </Head>
      <h2>{t("welcome")}! 👋</h2>
      <p>{t("chooseSignIn")}</p>
      <Spacer y={1.5} />
      <Login defaultLoginMethod="lightning" />
    </>
  );
};

export default SignInPage;

export { getStaticProps };
