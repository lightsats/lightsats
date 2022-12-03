import { Button, Grid, Row, Spacer, Text, Tooltip } from "@nextui-org/react";
import { AchievementType } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { UserCard } from "components/UserCard";
import { usePublicUser } from "hooks/usePublicUser";
import { DEFAULT_NAME } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { Routes } from "lib/Routes";
import { getUserAvatarUrl } from "lib/utils";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import Script from "next/script";

export default function UserPublicProfile() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { data: publicUser } = usePublicUser(id as string, true);
  const { t } = useTranslation("achievements");

  return (
    <>
      <UserCard userId={id as string} forceAnonymous />
      <Spacer />
      <Row>
        <Text h4>
          {publicUser?.name ?? DEFAULT_NAME}
          {"'s"} Achievements
        </Text>
      </Row>
      <Row>
        <Grid.Container gap={1}>
          {publicUser?.achievementTypes.map((achievementType) => (
            <Grid key={achievementType}>
              <Tooltip
                content={
                  t(`${achievementType}.title`) +
                  " - " +
                  t(`${achievementType}.description`)
                }
              >
                <div
                  style={{
                    background:
                      "linear-gradient(180deg, #FFDD00 0%, #FD5C00 100%)",
                    borderRadius: "50%",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      background:
                        "linear-gradient(180deg, #FFF7C3 0%, #FFE69C 100%)",
                      borderRadius: "100%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text b css={{ m: 0, p: 0, color: "#FD5C00" }}>
                      #{Object.values(AchievementType).indexOf(achievementType)}
                    </Text>
                  </div>
                </div>
              </Tooltip>
            </Grid>
          ))}
        </Grid.Container>
      </Row>
      <Spacer y={2} />
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

export { getStaticProps, getStaticPaths };
