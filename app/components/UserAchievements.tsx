import { Card, Text, Tooltip } from "@nextui-org/react";
import { AchievementType } from "@prisma/client";
import { usePublicUser } from "hooks/usePublicUser";
import React from "react";

import {
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  AtSymbolIcon,
  BoltIcon,
  FaceSmileIcon,
  FireIcon,
  GiftIcon,
  IdentificationIcon,
  LinkIcon,
  PlusCircleIcon,
  StarIcon,
  TrophyIcon,
  UserCircleIcon,
  UserIcon,
  UserPlusIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { FlexBox } from "components/FlexBox";
import { Icon } from "components/Icon";
import { useTranslation } from "next-i18next";

type UserAchievementsProps = {
  userId: string;
  showLocked?: boolean;
  small?: boolean;
};

export function UserAchievements(props: UserAchievementsProps) {
  return (
    <Card>
      <Card.Header>
        <Text h5>🏆 Achievements</Text>
      </Card.Header>
      <Card.Body
        css={{
          pt: 0,
          width: "100%",
        }}
      >
        <UserAchievementsGrid {...props} />
      </Card.Body>
    </Card>
  );
}

export function UserAchievementsGrid({
  userId,
  showLocked,
  small,
}: UserAchievementsProps) {
  const { data: publicUser } = usePublicUser(userId, true);
  const achievementStatuses = React.useMemo(
    () =>
      Object.values(AchievementType)
        .map((achievementType) => ({
          achievementType,
          unlocked:
            (publicUser?.achievementTypes.indexOf(achievementType) ?? -1) > -1,
        }))
        .filter((x) => showLocked || x.unlocked)
        .sort((a, b) => {
          return Number(b.unlocked) - Number(a.unlocked);
        }),
    [publicUser?.achievementTypes, showLocked]
  );

  return (
    <FlexBox
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "center",
      }}
    >
      {achievementStatuses.map((achievementStatus) => (
        <AchievementBadge
          key={achievementStatus.achievementType}
          achievementType={achievementStatus.achievementType}
          unlocked={achievementStatus.unlocked}
          small={small}
        />
      ))}
    </FlexBox>
  );
}

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

  EARLY_SUPPORTER: { icon: <FaceSmileIcon /> },
  MOST_WITHDRAWN_TIPS: { icon: <BoltIcon /> },
  SENT_1K: { icon: <GiftIcon /> },
  SENT_10K: { icon: <GiftIcon /> },
  SENT_100K: { icon: <GiftIcon /> },
  SENT_1M: { icon: <GiftIcon /> },
  TOP_1: { icon: <StarIcon /> },
  TOP_3: { icon: <TrophyIcon /> },
  TOP_10: { icon: <FireIcon /> },
};

type AchievementBadgeProps = {
  achievementType: AchievementType;
  unlocked: boolean;
  small: boolean | undefined;
};

const AchievementBadge = ({
  achievementType,
  unlocked,
  small,
}: AchievementBadgeProps) => {
  const achievementBadge = achievementBadges[achievementType];
  const { t } = useTranslation("achievements");

  const styles: Record<string, React.CSSProperties> = React.useMemo(
    () => ({
      badge: {
        background: `linear-gradient(to bottom right, #2E74ED 0%, #9ac0ff 100%)`,
        filter:
          `hue-rotate(${
            (Object.values(AchievementType).indexOf(achievementType) /
              Object.values(AchievementType).length) *
            360
          }deg)` + (!unlocked ? " grayscale(1)" : ""),
        opacity: unlocked ? 1 : 0.75,
        position: "relative",
        margin: small ? 0 : "1em 2em",
        width: "3em",
        height: "5em",
        borderRadius: "6px",
        display: "inline-block",
        top: 0,
        transition: "all 0.2s ease",
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
        color: "#2E74ED",
        filter: "drop-shadow(0px 4px 4px #000)",
        width: "50px",
        height: "50px",
        position: "absolute",
        paddingTop: small ? "9px" : "6px",
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
    [achievementType, small, unlocked]
  );

  const badge = (
    <div
      style={{
        transform: small ? "scale(0.5)" : undefined,
        height: small ? "40px" : undefined,
      }}
    >
      <div style={styles.badge}>
        <div style={styles.before} />
        <div style={styles.after} />
        <div style={styles.circle}>
          <Icon width={32} height={32}>
            {achievementBadge.icon}
          </Icon>
        </div>
        {!small && (
          <div style={styles.ribbon}>
            {t(`${achievementType}.title`).replace(/[ ]+/g, "\n")}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      content={
        small
          ? t(`${achievementType}.title`) +
            ": " +
            t(`${achievementType}.description`)
          : t(`${achievementType}.description`)
      }
      css={{ mt: small ? 25 : 45 }}
      color="primary"
    >
      {badge}
    </Tooltip>
  );
};
