import { Col } from "@nextui-org/react";
import React from "react";

export function MyBitcoinJourneyContent({
  children,
}: React.PropsWithChildren<unknown>) {
  return <Col css={{ pb: 120 }}>{children}</Col>;
}
