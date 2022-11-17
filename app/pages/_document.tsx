import { CssBaseline } from "@nextui-org/react";
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import React from "react";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      styles: React.Children.toArray([initialProps.styles]),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {CssBaseline.flush()}
          <meta name="description" content="Gift sats without losing them ✌🏼" />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
            rel="stylesheet"
          />

          <meta name="application-name" content="Lightsats⚡" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Lightsats⚡" />
          <meta
            name="description"
            content="Orange pill the world around you. One tip at a time."
          />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#FFFFFF" />

          <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />

          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/icons/icon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/icons/icon-16x16.png"
          />
          <link rel="manifest" href="/manifest.json" />
          <link
            rel="mask-icon"
            href="/icons/safari-pinned-tab.svg"
            color="#FFFFFF"
          />
          <link rel="shortcut icon" href="/favicon.ico" />

          <meta
            name="twitter:title"
            content="Lightsats - Gift sats without losing them ✌️"
          />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://lightsats.com" />
          <meta
            name="twitter:description"
            content="Orange pill the world around you. One tip at a time."
          />
          <meta
            name="twitter:image"
            content="https://lightsats.com/icons/icon-512x512.png"
          />
          <meta name="twitter:creator" content="@lightsats21" />
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content="Lightsats - Gift sats without losing them ✌️"
          />
          <meta
            property="og:description"
            content="Orange pill the world around you. One tip at a time."
          />
          <meta property="og:site_name" content="Lightsats⚡" />
          <meta property="og:url" content="https://lightsats.com" />
          <meta
            property="og:image"
            content="https://lightsats.com/icons/icon-512x512.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
