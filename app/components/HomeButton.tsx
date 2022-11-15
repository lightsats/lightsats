import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";

export function HomeButton() {
  return (
    <NextLink href={Routes.home}>
      <a>
        <Button bordered>Take me home</Button>
      </a>
    </NextLink>
  );
}
