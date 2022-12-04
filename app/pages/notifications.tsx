import {
  Badge,
  Card,
  Col,
  Divider,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Notification } from "@prisma/client";
import { NextLink } from "components/NextLink";
import { formatDistance } from "date-fns";
import { useNotifications } from "hooks/useNotifications";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { connectedAccountsElementId } from "pages/profile";

type NotificationCardProps = {
  title: string;
  description: string;
  href: string;
};

const NotificationsPage: NextPage = () => {
  const { data: session } = useSession();
  const { data: notifications, mutate: mutateNotifications } =
    useNotifications();
  if (!session || !notifications) {
    return <Loading />;
  }
  return (
    <>
      <Head>
        <title>Lightsats⚡ - Notifications</title>
      </Head>
      <Row align="center" justify="center">
        <Text h4>🔔 Notifications</Text>
      </Row>
      <Card
        css={{
          width: "100%",
          dropShadow: "$sm",
          pt: 0,
        }}
      >
        <Card.Body css={{ pt: "$sm" }}>
          {notifications?.length ? (
            <>
              {notifications.map((notification, i) => {
                const notificationCardProps =
                  getNotificationCardProps(notification);
                return (
                  <>
                    <Spacer y={0.5} />
                    <NextLink href={notificationCardProps.href}>
                      <a
                        style={{ width: "100%" }}
                        onClick={() =>
                          markNotificationRead(
                            session.user.id,
                            notification.id,
                            mutateNotifications
                          )
                        }
                      >
                        <Row align="flex-start">
                          <Col span={0.75} css={{ ta: "center" }}>
                            {!notification.read && (
                              <Badge variant="dot" color="error" />
                            )}
                          </Col>
                          <Col>
                            <Row align="center">
                              <Text b>{notificationCardProps.title}</Text>
                            </Row>
                            <Row>
                              <Text>{notificationCardProps.description}</Text>
                            </Row>
                            <Row>
                              <Text color="$gray700" size="small">
                                {formatDistance(
                                  new Date(),
                                  new Date(notification.created)
                                )}{" "}
                                ago
                              </Text>
                            </Row>
                          </Col>
                        </Row>
                      </a>
                    </NextLink>
                    <Spacer y={0.5} />
                    {i < notifications.length - 1 && <Divider />}
                  </>
                );
              })}
            </>
          ) : (
            <Text>
              {
                "It looks like you don't have any notifications yet. Check back soon!"
              }
            </Text>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default NotificationsPage;

function getNotificationCardProps(
  notification: Notification
): NotificationCardProps {
  const { t } = useTranslation("achievement");

  switch (notification.type) {
    case "LINK_EMAIL":
      return {
        title: "Connect an email address",
        description: "Get notified when your tips are claimed or withdrawn.",
        href: Routes.profile + "#" + connectedAccountsElementId,
      };
    case "COMPLETE_PROFILE":
      return {
        title: "Complete your tipper profile",
        description: "Improve the authenticity of your tips.",
        href: Routes.profile,
      };
    case "TIP_CLAIMED":
      return {
        title: "Your tip was claimed",
        description:
          "Good job, your recipient has started their Bitcoin journey!",
        href: `${Routes.tips}/${notification.tipId}`,
      };
    case "TIP_WITHDRAWN":
      return {
        title: "Your tip was withdrawn",
        description: "Nice work on the orange pill 🍊💊",
        href: `${Routes.tips}/${notification.tipId}`,
      };
    case "ACHIEVEMENT_UNLOCKED":
      return {
        title: "Achievement unlocked",
        description: t(`${notification.achievementType}.title`) ?? "Unknown",
        href: Routes.profile,
      };
    default:
      throw new Error("Unsupported notification type: " + notification.type);
  }
}
async function markNotificationRead(
  userId: string,
  notificationId: string,
  mutateNotifications: () => void
) {
  const result = await fetch(
    `/api/users/${userId}/notifications/${notificationId}/markRead`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );
  if (!result.ok) {
    console.error("Failed to mark notification as read: " + result.status);
  } else {
    mutateNotifications();
  }
}
