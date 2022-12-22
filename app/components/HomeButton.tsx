import { Button } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";
import { useSession } from "next-auth/react";

export function HomeButton() {
  const { data: session } = useSession();

  return (
    <NextLink href={session ? PageRoutes.dashboard : PageRoutes.home} passHref>
      <a>
        <Button bordered>Take me home</Button>
      </a>
    </NextLink>
  );
}
