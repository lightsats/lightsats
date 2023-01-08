import { Spacer } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { isMobile } from "lib/utils";

export function MobilePrintWarning() {
  return isMobile() ? (
    <>
      <Alert>
        Printing on mobile may cause unexpected results. Please try on PC or
        Laptop.
      </Alert>
      <Spacer />
    </>
  ) : null;
}
