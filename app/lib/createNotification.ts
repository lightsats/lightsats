import { NotificationType } from "@prisma/client";
import prisma from "lib/prismadb";

export async function createNotification(
  userId: string,
  type: NotificationType,
  tipId?: string
) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
  });

  const isRepeatable = isNotificationTypeRepeatable(type);

  if (
    isRepeatable ||
    !notifications.some((notification) => notification.type === type)
  ) {
    await prisma.notification.create({
      data: {
        userId,
        type,
        tipId,
      },
    });
  }
}
function isNotificationTypeRepeatable(type: NotificationType) {
  switch (type) {
    case "COMPLETE_PROFILE":
    case "LINK_EMAIL":
      return false;
    case "TIP_CLAIMED":
    case "TIP_WITHDRAWN":
      return true;
  }
}
