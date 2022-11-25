import { Button } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { NextLink } from "components/NextLink";
import { Routes } from "lib/Routes";

export function WithdrawSuggestion() {
  return (
    <>
      <Alert>
        {"You've got some tips. Make sure to withdraw them before they expire."}
        &nbsp;&nbsp;
        <NextLink href={Routes.journeyClaimed} passHref>
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
