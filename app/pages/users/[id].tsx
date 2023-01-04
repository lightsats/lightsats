import { Button, Row, Spacer, Text } from "@nextui-org/react";
import { NextLink } from "components/NextLink";
import { UserAchievements } from "components/UserAchievements";
import { UserCard } from "components/UserCard";
import { usePublicUser } from "hooks/usePublicUser";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Script from "next/script";

export default function UserPublicProfile() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { data: publicUser } = usePublicUser(id as string, true);

  return (
    <>
      <UserCard userId={id as string} forceAnonymous />
      <Spacer />
      <UserAchievements userId={id as string} showLocked />
      {publicUser?.lightningAddress && (
        <>
          <Script src="https://embed.twentyuno.net/js/app.js" />
          <Spacer />
          <Row>
            <lightning-widget
              name=""
              style={{ width: "100%" }}
              accent="#2E74ED"
              to={publicUser.lightningAddress}
              image={getUserAvatarUrl(publicUser)}
            />
          </Row>
        </>
      )}
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
