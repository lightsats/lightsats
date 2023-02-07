import { isMobile } from "lib/utils";
import React from "react";

export function useIsMobile() {
  const [_isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (isMobile()) {
      setIsMobile(true);
    }
  }, []);
  return _isMobile;
}
