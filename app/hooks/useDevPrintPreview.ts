import React from "react";

export function useDevPrintPreview() {
  React.useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEST_PRINT === "true") {
      document.body.style.overflowX = "visible";
    }
  }, []);
}
