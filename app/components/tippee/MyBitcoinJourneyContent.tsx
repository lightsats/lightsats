import { FlexBox } from "components/FlexBox";
import React from "react";

export function MyBitcoinJourneyContent({
  children,
}: React.PropsWithChildren<unknown>) {
  return (
    <FlexBox style={{ justifyContent: "center", alignItems: "center" }}>
      {children}
    </FlexBox>
  );
}
