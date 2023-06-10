import { Button, Card, Row, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { PageRoutes } from "lib/PageRoutes";

export function ClaimTipsFaster() {
  return (
    <Card css={{ dropShadow: "$sm" }}>
      <Card.Body css={{ textAlign: "center" }}>
        <Text h3>Claim Tips Faster</Text>
        <Text>
          Lightsats makes it easy for you to send and receive tips using
          Lightning⚡
        </Text>
        <Spacer />
        <Row justify="center">
          <NextLink href={PageRoutes.signin}>
            <a>
              <Button auto color="primary">
                <>{"🚀 Sign in"}</>
              </Button>
            </a>
          </NextLink>
        </Row>
      </Card.Body>
    </Card>
  );
}
