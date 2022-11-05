import { Button, Row } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import React from "react";

type MyBitcoinJourneyFooterProps = {
  text: React.ReactNode;
  href: string;
};

export function MyBitcoinJourneyFooter({
  text,
  href,
}: MyBitcoinJourneyFooterProps) {
  return (
    <>
      {/* add space for fixed element below */}
      <div style={{ height: "60px" }} />
      <Row justify="center">
        <NextLink href={href} passHref>
          <a>
            <Button>{text}</Button>
          </a>
        </NextLink>
      </Row>
    </>
  );
}
