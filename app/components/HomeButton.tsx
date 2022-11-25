import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";

export function DashboardButton() {
  return (
    <NextLink href={Routes.dashboard}>
      <a>
        <Button bordered>Take me home</Button>
      </a>
    </NextLink>
  );
}
