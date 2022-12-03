import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { Button, Grid, Row, Spacer, Text, Tooltip } from "@nextui-org/react";
import { AchievementType } from "@prisma/client";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { UserCard } from "components/UserCard";
import { usePublicUser } from "hooks/usePublicUser";
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

type BadgeProps = {
  color: string;
  text: string;
};

const Badge = ({ color, text }: BadgeProps) => {
  const styles = {
    badge: {
      background: "linear-gradient(to bottom right, #ffeb3b 0%, #fbc02d 100%)",
      position: "relative",
      margin: "1.5em 3em",
      width: "4em",
      height: "6.2em",
      borderRadius: "10px",
      display: "inline-block",
      top: 0,
      transition: "all 0.2s ease",
      "&::hover": {
        top: "-5px",
      },
    },
    before: {
      position: "absolute",
      width: "inherit",
      height: "inherit",
      borderRadius: "inherit",
      background: "inherit",
      content: '""',
      transform: "rotate(60deg)",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: "auto",
    },
    after: {
      position: "absolute",
      width: "inherit",
      height: "inherit",
      borderRadius: "inherit",
      background: "inherit",
      content: '""',
      margin: "auto",
      transform: "rotate(-60deg)",
    },
    circle: {
      color: color,
      width: "60px",
      height: "60px",
      position: "absolute",
      paddingTop: "10px",
      background: "#fff",
      zIndex: 10,
      borderRadius: "50%",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      margin: "auto",
      textAlign: "center",
    },
    font: {
      display: "inline-block",
      marginTop: "1em",
    },
    ribbon: {
      position: "absolute",
      borderRadius: "4px",
      padding: "3px 5px",
      textAlign: "center",
      whiteSpace: "nowrap",
      zIndex: 11,
      fontSize: 12,
      minWidth: "80px",
      color: "#fff",
      bottom: 12,
      left: "50%",
      transform: "translateX(-50%)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.27)",
      textShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
      textTransform: "uppercase",
      background: "linear-gradient(to bottom right, #555 0%, #333 100%)",
      cursor: "default",
    },
  };

  return (
    <Tooltip content={text}>
      <div style={styles.badge}>
        <div style={styles.before} />
        <div style={styles.after} />
        <div style={styles.circle}>
          <Icon width={32} height={32}>
            <HandThumbUpIcon />
          </Icon>
        </div>
        <div style={styles.ribbon}>{text}</div>
      </div>
    </Tooltip>
  );
};
