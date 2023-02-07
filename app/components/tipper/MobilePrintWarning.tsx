import { Spacer } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { useIsMobile } from "hooks/useIsMobile";

export function MobilePrintWarning() {
  const isMobile = useIsMobile();

  return isMobile ? (
    <>
      <Alert>
        Printing on mobile may cause unexpected results. Please try on PC or
        Laptop.
      </Alert>
      <Spacer />
    </>
  ) : null;
}
