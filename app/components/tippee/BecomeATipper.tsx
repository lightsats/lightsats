import { Button, Card, Loading, Row, Spacer, Text } from "@nextui-org/react";
import { useUser } from "hooks/useUser";
import React from "react";
import toast from "react-hot-toast";
import { TransitionUserRequest } from "types/TransitionUserRequest";

export function BecomeATipper() {
  const [isSubmitting, setSubmitting] = React.useState(false);
  const { data: user, mutate: mutateUser } = useUser();

  const becomeTipper = React.useCallback(() => {
    if (!user?.id) {
      return;
    }
    if (isSubmitting) {
      throw new Error("Already submitting");
    }
    setSubmitting(true);

    (async () => {
      const transitionRequest: TransitionUserRequest = {
        to: "tipper",
      };
      const result = await fetch(`/api/users/${user.id}/transition`, {
        method: "POST",
        body: JSON.stringify(transitionRequest),
        headers: { "Content-Type": "application/json" },
      });
      if (result.ok) {
        await mutateUser();
      } else {
        toast.error("Failed to update profile: " + result.statusText);
      }
      setSubmitting(false);
    })();
  }, [isSubmitting, mutateUser, user?.id]);

  return (
    <Card css={{ dropShadow: "$sm" }}>
      <Card.Body css={{ textAlign: "center" }}>
        <Text h3>Ready to start tipping in bitcoin?</Text>
        <Text>
          Lightsats makes it easy for you to send tips and onboard people to
          bitcoin.
        </Text>
        <Spacer />
        <Row justify="center">
          <Button
            auto
            color="primary"
            onClick={becomeTipper}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loading color="currentColor" size="sm" />
            ) : (
              <>{"🚀 Let's go!"}</>
            )}
          </Button>
        </Row>
      </Card.Body>
    </Card>
  );
}
