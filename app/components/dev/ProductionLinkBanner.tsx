import { Spacer } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { NextLink } from "components/NextLink";

export function ProductionLinkBanner() {
  return (
    <>
      <NextLink href="https://lightsats.com">
        <a>
          <Alert>DEV ENVIRONMENT - CLICK HERE TO GO TO PRODUCTION</Alert>
        </a>
      </NextLink>
      <Spacer />
    </>
  );
}
