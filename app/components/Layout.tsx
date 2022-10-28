import { Container, Spacer } from "@nextui-org/react";
import { AppNavbar } from "components/AppNavbar";
import React from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type LayoutProps = {};

export default function Layout({
  children,
}: React.PropsWithChildren<LayoutProps>) {
  return (
    <>
      <AppNavbar />
      <Spacer />
      <Container
        justify="center"
        alignItems="center"
        display="flex"
        direction="column"
        fluid
      >
        {children}
      </Container>
      <Spacer />
    </>
  );
}
