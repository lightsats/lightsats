import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  AtSymbolIcon,
  BoltIcon,
  IdentificationIcon,
  LinkIcon,
  PlusCircleIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Grid,
  Row,
  Spacer,
  Text,
  Tooltip,
} from "@nextui-org/react";
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

  return (
    <>
      <UserCard userId={id as string} forceAnonymous />
      <Spacer />
      <Card>
        <Card.Header>
          <Text h5>🏆 Achievements</Text>
        </Card.Header>
        <Card.Body css={{ pt: 0 }}>
          <Grid.Container gap={1}>
            {publicUser?.achievementTypes.map((achievementType) => (
              <Grid key={achievementType} lg={5}>
                <Badge achievementType={achievementType} />
              </Grid>
            ))}
          </Grid.Container>
        </Card.Body>
      </Card>
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
  achievementType: AchievementType;
  color: string;
};

const achievements = {
  SELF_CLAIMED: {
    icon: <ArrowPathRoundedSquareIcon />,
    color: "#2E74ED",
  },
  BECAME_TIPPER: {
    icon: <UserIcon />,
    color: "#2E74ED",
  },
  LINKED_EMAIL: {
    icon: <AtSymbolIcon />,
    color: "#ffc700",
  },
  LINKED_WALLET: {
    icon: <LinkIcon />,
    color: "#ffc700",
  },
  SET_NAME: {
    icon: <IdentificationIcon />,
    color: "#CC69DA",
  },
  SET_AVATAR_URL: {
    icon: <UserCircleIcon />,
    color: "#CC69DA",
  },
  SET_LIGHTNING_ADDRESS: {
    icon: <BoltIcon />,
    color: "#FFC560",
  },
  CREATED_TIP: {
    icon: <PlusCircleIcon />,
    color: "#2E74ED",
  },
  FUNDED_TIP: { icon: <WalletIcon />, color: "#ffc700" },
  TIP_CLAIMED: { icon: <UserPlusIcon />, color: "#FF907D" },
  TIP_WITHDRAWN: { icon: <ArrowsRightLeftIcon />, color: "#F9F871" },
  WEBLN_WITHDRAWN: { icon: <ArrowsRightLeftIcon />, color: "#F9F871" },
  MANUAL_WITHDRAWN: { icon: <ArrowsRightLeftIcon />, color: "#F9F871" },
  LNURL_WITHDRAWN: { icon: <ArrowsRightLeftIcon />, color: "#F9F871" },
};

const Badge = ({ achievementType }: BadgeProps) => {
  const { t } = useTranslation("achievements");
  const achievement = achievements[achievementType];

  const styles = {
    badge: {
      background: `linear-gradient(to bottom right, ${achievement.color} 0%, #AAAAAAAA 100%)`,
      position: "relative",
      margin: "1em 2em",
      width: "3em",
      height: "5em",
      borderRadius: "6px",
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
      transform: "rotate(-60deg)",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: "auto",
    },
    circle: {
      color: achievement.color,
      width: "50px",
      height: "50px",
      position: "absolute",
      paddingTop: "6px",
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
      fontSize: 11,
      minWidth: "70px",
      color: "#fff",
      bottom: 5,
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
    <Tooltip
      content={t(`${achievementType}.description`)}
      css={{ mt: 45 }}
      color="primary"
    >
      <div style={styles.badge}>
        <div style={styles.before} />
        <div style={styles.after} />
        <div style={styles.circle}>
          <Icon width={32} height={32}>
            {achievement.icon}
          </Icon>
        </div>
        <div style={styles.ribbon}>{t(`${achievementType}.title`)}</div>
      </div>
    </Tooltip>
  );
};
