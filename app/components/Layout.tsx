import { Container, Spacer } from "@nextui-org/react";
import { AppNavbar } from "components/AppNavbar";
import { ProductionLinkBanner } from "components/dev/ProductionLinkBanner";
import { FlexBox } from "components/FlexBox";
import { useUserLocale } from "hooks/useUserLocale";
import { Routes } from "lib/Routes";
import { useRouter } from "next/router";
import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type LayoutProps = {};

export default function Layout({
  children,
}: React.PropsWithChildren<LayoutProps>) {
  useUserLocale();
  const router = useRouter();
  return (
    <FlexBox style={{ minHeight: "100%" }}>
      {process.env.NEXT_PUBLIC_SHOW_PRODUCTION_LINK === "true" && (
        <ProductionLinkBanner />
      )}
      <AppNavbar />
      <Spacer y={2} />
      <Container
        justify="flex-start"
        alignItems="center"
        display="flex"
        direction="column"
        fluid
        lg
        css={{
          margin: "0px auto",
          flex: 1,
          ...(router.pathname !== Routes.scoreboard &&
          router.pathname !== Routes.admin &&
          router.pathname !== Routes.about &&
          !router.pathname.endsWith("/qr") &&
          router.pathname !== Routes.home
            ? { maxWidth: "600px" }
            : { maxWidth: "1400px" }),
        }}
      >
        {children}
      </Container>
      <Spacer />
    </FlexBox>
  );
}
