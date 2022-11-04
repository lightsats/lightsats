import { Button, Row, Spacer } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
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
      <FlexBox
        style={{
          position: "fixed",
          bottom: 0,
          background: "white",
          width: "100vw",
        }}
      >
        <Spacer y={1} />
        <Row justify="center">
          <NextLink href={href} passHref>
            <a>
              <Button>{text}</Button>
            </a>
          </NextLink>
        </Row>
        <Spacer y={1} />
      </FlexBox>
    </>
  );
}
