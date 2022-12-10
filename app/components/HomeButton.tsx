import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";

export function DashboardButton() {
  return (
    <NextLink href={PageRoutes.dashboard}>
      <a>
        <Button bordered>Take me home</Button>
      </a>
    </NextLink>
  );
}
