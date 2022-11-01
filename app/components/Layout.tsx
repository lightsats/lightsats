import { Container, Spacer } from "@nextui-org/react";
import { AppNavbar } from "components/AppNavbar";
import { FlexBox } from "components/FlexBox";
import { Routes } from "lib/Routes";
import { useRouter } from "next/router";
import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type LayoutProps = {};

export default function Layout({
  children,
}: React.PropsWithChildren<LayoutProps>) {
  const router = useRouter();
  return (
    <FlexBox style={{ minHeight: "100%" }}>
      <AppNavbar />
      <Spacer />
      <Container
        justify="flex-start"
        alignItems="center"
        display="flex"
        direction="column"
        fluid
        css={{
          flex: 1,
          ...(router.pathname !== Routes.scoreboard &&
          router.pathname !== Routes.admin
            ? { maxWidth: "400px" }
            : {}),
        }}
      >
        {children}
      </Container>
      <Spacer />
    </FlexBox>
  );
}
