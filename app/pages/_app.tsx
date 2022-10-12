import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { NextUIProvider } from "@nextui-org/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </NextUIProvider>
  );
}

export default MyApp;
