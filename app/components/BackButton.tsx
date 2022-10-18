import { Link } from "@nextui-org/react";
import { Routes } from "lib/Routes";
import NextLink from "next/link";

export function BackButton() {
  return (
    <NextLink href={Routes.home} passHref>
      <Link>Back</Link>
    </NextLink>
  );
}
