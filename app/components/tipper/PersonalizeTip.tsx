import { Button, Card, Row, Spacer, Text } from "@nextui-org/react";
import { NextImage } from "components/NextImage";
import { NextLink } from "components/NextLink";

type PersonalizeTipProps = {
  href: string;
  bulk?: boolean;
};

export function PersonalizeTip({ href, bulk }: PersonalizeTipProps) {
  return (
    <Card css={{ dropShadow: "$sm", background: "$primary" }}>
      <Card.Body>
        <Row justify="center">
          <Text h3 css={{ color: "$white", ta: "center" }}>
            {bulk ? "Personalize your tips" : "Personalize your tip"}
          </Text>
        </Row>
        <Row justify="center">
          <NextImage
            src="/images/icons/personalize.png"
            width={150}
            height={150}
            alt="zap"
          />
        </Row>
        <Row justify="center">
          <Text css={{ textAlign: "center", color: "$white" }}>
            {bulk
              ? "Provide extra details to improve your recipients' onboarding experiences"
              : "Provide extra details to improve your recipient's onboarding experience"}
          </Text>
        </Row>
        <Spacer />
        <Row justify="center">
          <NextLink href={href} passHref>
            <a>
              <Button size="md" color="secondary">
                {bulk ? "Personalize tips" : "Personalize tip"}
              </Button>
            </a>
          </NextLink>
        </Row>
      </Card.Body>
    </Card>
  );
}
