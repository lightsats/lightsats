import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";

export function NewTipButton() {
  return (
    <NextLink href={PageRoutes.newTip}>
      <a>
        <Button>
          <Icon>
            <PlusCircleIcon />
          </Icon>
          &nbsp;Create a new tip
        </Button>
      </a>
    </NextLink>
  );
}
