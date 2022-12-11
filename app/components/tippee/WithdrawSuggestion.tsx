import { Button } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";

export function WithdrawSuggestion() {
  return (
    <>
      <Alert>
        {"You've got some tips. Make sure to withdraw them before they expire."}
        &nbsp;&nbsp;
        <NextLink href={PageRoutes.journeyClaimed} passHref>
          <a>
            <Button auto color="success">
              Withdraw
            </Button>
          </a>
        </NextLink>
      </Alert>
    </>
  );
}
