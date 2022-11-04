import { Card, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";

export function ProductionLinkBanner() {
  return (
    <>
      <NextLink href="https://lightsats.com">
        <a>
          <Card css={{ bg: "$error" }}>
            <Card.Body>
              <Text size="x-small" color="white" b>
                DEV ENVIRONMENT - CLICK HERE TO GO TO PRODUCTION
              </Text>
            </Card.Body>
          </Card>
        </a>
      </NextLink>
      <Spacer />
    </>
  );
}
