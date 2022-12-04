import { BellIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Col,
  Grid,
  Loading,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Notification } from "@prisma/client";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { formatDistance } from "date-fns";
import { useNotifications } from "hooks/useNotifications";
import { Routes } from "lib/Routes";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
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
      <Text h3>🔔 Notifications</Text>
      {notifications?.length ? (
        <Grid.Container gap={1}>
          {notifications.map((notification) => {
            const notificationCardProps =
              getNotificationCardProps(notification);
            return (
              <Grid key={notificationCardProps.title} xs={12}>
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
                    <Card
                      css={{
                        width: "100%",
                        background: notification.read ? "$accents1" : undefined,
                        dropShadow: "$sm",
                      }}
                    >
                      <Card.Body>
                        <Row align="center">
                          <Button
                            color={notification.read ? "default" : "error"}
                            auto
                            flat
                            css={{
                              px: 18,
                              background: notification.read
                                ? "$accents2"
                                : undefined,
                              color: notification.read
                                ? "$accents5"
                                : undefined,
                            }}
                            size="xl"
                          >
                            <Icon>
                              <BellIcon />
                            </Icon>
                          </Button>
                          <Spacer />
                          <Col>
                            <Row>
                              <Text b>{notificationCardProps.title}</Text>
                            </Row>
                            <Row>
                              <Text>{notificationCardProps.description}</Text>
                            </Row>
                            <Row justify="flex-end">
                              <Text size="small" css={{ mb: -10 }}>
                                {formatDistance(
                                  new Date(),
                                  new Date(notification.created)
                                )}{" "}
                                ago
                              </Text>
                            </Row>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </a>
                </NextLink>
              </Grid>
            );
          })}
        </Grid.Container>
      ) : (
        <Text>
          {
            "It looks like you don't have any notifications yet. Check back soon!"
          }
        </Text>
      )}
    </>
  );
};

export default NotificationsPage;

function getNotificationCardProps(
  notification: Notification
): NotificationCardProps {
  switch (notification.type) {
    case "LINK_EMAIL":
      return {
        title: "Connect an Email address",
        description: "Get notified when your tips are claimed and withdrawn",
        href: Routes.profile + "#" + connectedAccountsElementId,
      };
    case "COMPLETE_PROFILE":
      return {
        title: "Complete your tipper profile",
        description: "Improve the authenticity of your tips",
        href: Routes.profile,
      };
    case "TIP_CLAIMED":
      return {
        title: "Your tip was claimed!",
        description:
          "Good job. Your recipient has started their Bitcoin journey!",
        href: `${Routes.tips}/${notification.tipId}`,
      };
    case "TIP_WITHDRAWN":
      return {
        title: "Your tip was withdrawn!",
        description: "Nice work on the orange pill 🍊💊",
        href: `${Routes.tips}/${notification.tipId}`,
      };
    case "ACHIEVEMENT_UNLOCKED":
      return {
        title: "Achievement unlocked!",
        description: notification.achievementType ?? "Unknown",
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
