import { User } from "@prisma/client";
import { useUser } from "hooks/useUser";
import { Routes } from "lib/Routes";
import { connectedAccountsElementId } from "pages/profile";
import React from "react";
import { Notification } from "types/Notification";

export function useNotifications() {
  const { data: user } = useUser();
  const notifications = React.useMemo(
    () => (user ? calculateNotifications(user) : []),
    [user]
  );
  return notifications;
}

// TODO: move to backend so notifications can be marked as read
function calculateNotifications(user: User) {
  const notifications: Notification[] = [];
  if (user?.userType === "tipper" && !user.email) {
    notifications.push({
      title: "Connect an Email address",
      description: "Get notified when your tips are claimed and withdrawn",
      href: Routes.profile + "#" + connectedAccountsElementId,
    });
  }
  return notifications;
}
