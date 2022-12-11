import { Container, Spacer } from "@nextui-org/react";
import { AppNavbar } from "components/AppNavbar";
import { ProductionLinkBanner } from "components/dev/ProductionLinkBanner";
import { FlexBox } from "components/FlexBox";
import { useUserLocale } from "hooks/useUserLocale";
import { PageRoutes } from "lib/PageRoutes";
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
    <FlexBox style={{ minHeight: "100vh" }}>
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
          ...(!(
            router.pathname.startsWith(PageRoutes.leaderboard) &&
            !router.pathname.endsWith("new") &&
            !router.pathname.endsWith("edit")
          ) &&
          router.pathname !== PageRoutes.admin &&
          router.pathname !== PageRoutes.about &&
          !router.pathname.endsWith("/qr") &&
          router.pathname !== PageRoutes.home
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
