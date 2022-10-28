import { Button, Row, Spacer } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import NextLink from "next/link";
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
    <FlexBox
      style={{
        justifyContent: "flex-end",
      }}
    >
      <Row>
        <NextLink href={href} passHref>
          <a>
            <Button>{text}</Button>
          </a>
        </NextLink>
      </Row>
      <Spacer y={2} />
    </FlexBox>
  );
}
