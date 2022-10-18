import { Button } from "@nextui-org/react";
import { Routes } from "lib/Routes";
import NextLink from "next/link";

export function NewTipButton() {
  return (
    <NextLink href={Routes.newTip}>
      <a>
        <Button>New tip</Button>
      </a>
    </NextLink>
  );
}
