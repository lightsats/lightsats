import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";

export function NewTipButton() {
  return (
    <NextLink href={Routes.newTip}>
      <a>
        <Button>New tip</Button>
      </a>
    </NextLink>
  );
}
