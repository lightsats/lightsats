import { Button, Grid, Spacer, Text } from "@nextui-org/react";
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
      {/* <FlexBox style={{ flexDirection: "row", alignContent: "normal" }}>
        <FlexBox>
          {" "}
          <FlexBox style={{ flexDirection: "column" }}>
            <Text b small transform="uppercase">
              Next up
            </Text>
            <Text>{nextUp}</Text>
          </FlexBox>
        </FlexBox>
        <FlexBox>
          <NextLink href={href} passHref>
            <a>
              <Button size="lg" color="gradient">
                {text}
              </Button>
            </a>
          </NextLink>
        </FlexBox>
      </FlexBox> */}
      <Grid.Container>
        <Grid xs={6}>
          <FlexBox style={{ flexDirection: "column" }}>
            <Text b small transform="uppercase">
              Next up
            </Text>
            <Text>{nextUp}</Text>
          </FlexBox>
        </Grid>
        <Grid xs={6}>
          <NextLink href={href} passHref>
            <a>
              <Button size="lg" color="gradient">
                {text}
              </Button>
            </a>
          </NextLink>
        </Grid>
      </Grid.Container>
    </>
  );
}
