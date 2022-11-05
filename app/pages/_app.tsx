import { NextUIProvider } from "@nextui-org/react";
import Layout from "components/Layout";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";

import { appWithTranslation } from "next-i18next";
import "styles/globals.css";
import theme from "./_theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <NextUIProvider theme={theme}>
        <SessionProvider session={pageProps.session}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </NextUIProvider>
    </>
  );
}

export default appWithTranslation(MyApp);
