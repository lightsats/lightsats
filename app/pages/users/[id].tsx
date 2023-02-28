import { Button, Row, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { UserAchievements } from "components/UserAchievements";
import { UserCard } from "components/UserCard";
import { UserDonateWidget } from "components/UserDonateWidget";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function UserPublicProfile() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <UserCard userId={id as string} forceAnonymous />
      <Spacer />
      <UserDonateWidget userId={id as string} />
      <Spacer />
      <UserAchievements userId={id as string} showLocked />
      <Spacer y={2} />
      {sessionStatus === "unauthenticated" && (
        <>
          <Row justify="center">
            <Text h3>Want to join the tipping battle?</Text>
          </Row>
          <Row justify="center">
            <NextLink href={PageRoutes.signin}>
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

export { getStaticProps, getStaticPaths };
