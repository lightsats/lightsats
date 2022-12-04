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
import React from "react";

export default function UserPublicProfile() {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { data: publicUser } = usePublicUser(id as string, true);

  const achievementStatuses = React.useMemo(
    () =>
      Object.values(AchievementType).map((achievementType) => ({
        achievementType,
        unlocked:
          (publicUser?.achievementTypes.indexOf(achievementType) ?? -1) > -1,
      })),
    [publicUser?.achievementTypes]
  );

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
            {achievementStatuses.map((achievementStatus) => (
              <Grid key={achievementStatus.achievementType}>
                <AchievementBadge
                  achievementType={achievementStatus.achievementType}
                  unlocked={achievementStatus.unlocked}
                />
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

const achievementBadges: Record<
  AchievementType,
  {
    icon: React.ReactNode;
  }
> = {
  SELF_CLAIMED: {
    icon: <ArrowPathRoundedSquareIcon />,
  },
  BECAME_TIPPER: {
    icon: <UserIcon />,
  },
  LINKED_EMAIL: {
    icon: <AtSymbolIcon />,
  },
  LINKED_WALLET: {
    icon: <LinkIcon />,
  },
  SET_NAME: {
    icon: <IdentificationIcon />,
  },
  SET_AVATAR_URL: {
    icon: <UserCircleIcon />,
  },
  SET_LIGHTNING_ADDRESS: {
    icon: <BoltIcon />,
  },
  CREATED_TIP: {
    icon: <PlusCircleIcon />,
  },
  FUNDED_TIP: { icon: <WalletIcon /> },
  TIP_CLAIMED: { icon: <UserPlusIcon /> },
  TIP_WITHDRAWN: { icon: <ArrowsRightLeftIcon /> },
  WEBLN_WITHDRAWN: { icon: <ArrowsRightLeftIcon /> },
  MANUAL_WITHDRAWN: { icon: <ArrowsRightLeftIcon /> },
  LNURL_WITHDRAWN: { icon: <ArrowsRightLeftIcon /> },
};

type AchievementBadgeProps = {
  achievementType: AchievementType;
  unlocked: boolean;
};

const AchievementBadge = ({
  achievementType,
  unlocked,
}: AchievementBadgeProps) => {
  const achievementBadge = achievementBadges[achievementType];
  const { t } = useTranslation("achievements");

  const styles: Record<string, React.CSSProperties> = React.useMemo(
    () => ({
      badge: {
        background: `linear-gradient(to bottom right, #FF0 0%, #990 100%)`,
        filter: `hue-rotate(${
          (Object.values(AchievementType).indexOf(achievementType) /
            Object.values(AchievementType).length) *
          360
        }deg);`,
        opacity: unlocked ? 1 : 0.25,
        position: "relative",
        margin: "1em 2em",
        width: "3em",
        height: "5em",
        borderRadius: "6px",
        display: "inline-block",
        top: 0,
        transition: "all 0.2s ease",
        // "&::hover": {
        //   top: "-5px",
        // },
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
        color: "#AA0", //achievementBadge.color,
        filter: "drop-shadow(0px 4px 4px #000)",
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
        zIndex: 11,
        fontSize: 11,
        minWidth: "70px",
        color: "#fff",
        top: 50,
        left: "50%",
        transform: "translateX(-50%)",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.27)",
        textShadow: "0 2px 2px rgba(0, 0, 0, 0.1)",
        textTransform: "uppercase",
        background: "linear-gradient(to bottom right, #555 0%, #333 100%)",
        cursor: "default",
      },
    }),
    [achievementType, unlocked]
  );

  return (
    <Tooltip
      content={t(`${achievementType}.description`)}
      css={{ mt: 45 }}
      color="primary"
    >
      <div style={{ width: "100px" }}>
        <div style={styles.badge}>
          <div style={styles.before} />
          <div style={styles.after} />
          <div style={styles.circle}>
            <Icon width={32} height={32}>
              {achievementBadge.icon}
            </Icon>
          </div>
          <div style={styles.ribbon}>
            {t(`${achievementType}.title`).replace(/[ ]+/g, "\n")}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};
