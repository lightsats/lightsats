import { Card, Row, Spacer, Text } from "@nextui-org/react";
import { BecomeATipper } from "components/tippee/BecomeATipper";
import { ClaimTipsFaster } from "components/tippee/ClaimTipsFaster";
import { NewTipButton } from "components/tipper/NewTipButton";
import { useSession } from "next-auth/react";

type UnavailableTipActionsProps = {
  skipOnboarding: boolean;
};

export function UnavailableTipActions({
  skipOnboarding,
}: UnavailableTipActionsProps) {
  const { data: session } = useSession();

  return !session && !skipOnboarding ? (
    <>
      <Spacer />
      <ClaimTipsFaster />
    </>
  ) : session?.user.userType !== "tipper" ? (
    <>
      <Spacer />
      <BecomeATipper />
    </>
  ) : (
    <>
      <Spacer />
      <Card css={{ dropShadow: "$sm" }}>
        <Card.Body css={{ textAlign: "center" }}>
          <Text h3>Send a tip instead</Text>
          <Text>
            Lightsats makes it easy for you to send tips and onboard people to
            bitcoin.
          </Text>
          <Spacer />
          <Row justify="center">
            <NewTipButton />
          </Row>
        </Card.Body>
      </Card>
    </>
  );
}
