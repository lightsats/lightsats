import { Button, Container, Spacer, Text } from "@nextui-org/react";
import { FlexBox } from "components/FlexBox";
import { NextLink } from "components/NextLink";
import React from "react";

type MyBitcoinJourneyFooterProps = {
  text: React.ReactNode;
  href: string;
  nextUp: string;
};

export function MyBitcoinJourneyFooter({
  text,
  href,
  nextUp,
}: MyBitcoinJourneyFooterProps) {
  return (
    <>
      <Spacer y={3} />
      <Container style={{ padding: 0 }}>
        <FlexBox
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <FlexBox style={{ flex: 1 }}>
            <FlexBox style={{ flexDirection: "column" }}>
              <Text b small transform="uppercase">
                Next up
              </Text>
              <Text>{nextUp}</Text>
            </FlexBox>
          </FlexBox>
          <FlexBox style={{ flex: 0 }}>
            <NextLink href={href} passHref>
              <a>
                <Button size="lg" auto>
                  {text}
                </Button>
              </a>
            </NextLink>
          </FlexBox>
        </FlexBox>
      </Container>
    </>
  );
}
