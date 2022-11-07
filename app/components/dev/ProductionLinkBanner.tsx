import { Card, Container } from "@nextui-org/react";
import { NextLink } from "components/NextLink";

export function ProductionLinkBanner() {
  return (
    <>
      <NextLink href="https://lightsats.com">
        <a>
          <Card
            color="$warning"
            variant="flat"
            css={{
              backgroundColor: "$warningLight",
              borderColor: "$warningBorder",
              borderRadius: 0,
            }}
          >
            <Card.Body>
              <Container lg css={{ textAlign: "center" }}>
                ⚠️ This is the <b>development</b> environment.
              </Container>
            </Card.Body>
          </Card>
        </a>
      </NextLink>
    </>
  );
}
