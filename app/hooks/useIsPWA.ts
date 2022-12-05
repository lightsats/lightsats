import { isPWA } from "lib/utils";
import React from "react";

export function useIsPWA() {
  const [clientIsPWA, setIsPWA] = React.useState(false);
  React.useEffect(() => {
    if (isPWA()) {
      setIsPWA(true);
    }
  }, []);
  return clientIsPWA;
}
