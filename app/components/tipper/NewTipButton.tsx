import NextLink from "next/link";
import { Routes } from "../../lib/Routes";
import { Button } from "@nextui-org/react";

export function NewTipButton() {
  return (
    <NextLink href={Routes.newTip}>
      <a>
        <Button>New tip</Button>
      </a>
    </NextLink>
  );
}
