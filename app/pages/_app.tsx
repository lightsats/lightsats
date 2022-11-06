import { NextUIProvider } from "@nextui-org/react";
import Layout from "components/Layout";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import "styles/globals.css";

import AppErrorBoundary from "components/AppErrorBoundary";
import { appWithTranslation } from "next-i18next";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>
      <AppErrorBoundary>
        <NextUIProvider>
          <SessionProvider session={pageProps.session}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SessionProvider>
        </NextUIProvider>
      </AppErrorBoundary>
    </>
  );
}

export default appWithTranslation(MyApp);
