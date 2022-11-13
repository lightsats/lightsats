import { Button, Row, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { UserCard } from "components/UserCard";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { useRouter } from "next/router";

export default function UserPublicProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: user } = useUser();

  return (
    <>
      <UserCard userId={id as string} forceAnonymous />
      <Spacer y={2} />
      {!user && (
        <>
          <Row justify="center">
            <Text h3>Want join the tipping battle?</Text>
          </Row>
          <Row justify="center">
            <NextLink href={Routes.login}>
              <a>
                <Button auto>Create your account</Button>
              </a>
            </NextLink>
          </Row>
        </>
      )}
    </>
  );
}
