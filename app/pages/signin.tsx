import { Spacer, Text } from "@nextui-org/react";
import { LightningLoginButton } from "components/LightningLoginButton";
import { getStaticProps } from "lib/i18n/i18next";
import type { NextPage } from "next";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import EmailSignIn from "pages/auth/signin/email";
import PhoneSignIn from "pages/auth/signin/phone";

const SignInPage: NextPage = () => {
  const { t } = useTranslation(["claim", "common"]);
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Sign in</title>
      </Head>
      <h2>Sign in</h2>
      <PhoneSignIn />
      <Spacer y={0.5} />
      <Text>{t("common:or")}</Text>
      <Spacer y={0.5} />
      <EmailSignIn />
      <Spacer y={0.5} />
      <Text>{t("common:or")}</Text>
      <Spacer y={0.5} />
      <LightningLoginButton />
    </>
  );
};

export default SignInPage;

export { getStaticProps };
