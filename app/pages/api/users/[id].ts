import { Achievement, Notification, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { createAchievement } from "lib/createAchievement";
import { createNotification } from "lib/createNotification";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import prisma from "lib/prismadb";
import { getFallbackAvatarId } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { PublicUser } from "types/PublicUser";
import { UpdateUserRequest } from "types/UpdateUserRequest";

type ExtendedUser = User & {
  notifications: Notification[];
  achievements: Achievement[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | PublicUser | never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  const { id, publicProfile, forceAnonymous } = req.query;

  if (session?.user.id !== id || publicProfile === "true") {
    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: {
          id: id as string,
        },
        include: {
          tipsSent: true,
          tipsReceived: true,
          achievements: true,
        },
      });
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).end();
      }

      const sentTips = user.tipsSent.filter(
        (tip) => tip.status === "WITHDRAWN"
      );
      const satsTipped = sentTips.length
        ? sentTips.map((tip) => tip.amount).reduce((a, b) => a + b)
        : 0;

      const publicUser: PublicUser = {
        id: user.id,
        created: user.created,
        userType: user.userType,
        lightningAddress: user.lightningAddress,
        ...(user.isAnonymous &&
        (forceAnonymous === "true" || user.id !== session?.user.id)
          ? {
              name: null,
              avatarURL: null,
              twitterUsername: null,
            }
          : {
              name: user.name,
              avatarURL: user.avatarURL,
              twitterUsername: user.twitterUsername,
            }),
        fallbackAvatarId: getFallbackAvatarId(user),
        numTipsSent: sentTips.length,
        numTipsReceived: user.tipsReceived.length,
        satsTipped: satsTipped,
        achievements: user.achievements.map((achievement) => achievement.type),
      };
      return res.json(publicUser);
    }
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id as string,
    },
    include: {
      notifications: true,
      achievements: true,
    },
  });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  switch (req.method) {
    case "PUT":
      return updateUser(user, req, res);
    case "GET":
      return getUser(user, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function updateUser(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const updateUserRequest: UpdateUserRequest = req.body;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      name: updateUserRequest.name ?? null,
      twitterUsername: updateUserRequest.twitterUsername ?? null,
      avatarURL: updateUserRequest.avatarURL ?? null,
      lightningAddress: updateUserRequest.lightningAddress ?? null,
      isAnonymous: updateUserRequest.isAnonymous,
      locale: updateUserRequest.locale ?? DEFAULT_LOCALE,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
async function getUser(
  user: ExtendedUser,
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  await createUserNotifications(user);
  await createUserAchievements(user);

  return res.status(StatusCodes.OK).json(user);
}

async function createUserNotifications(user: ExtendedUser) {
  if (user.userType === "tipper") {
    if (!user.email) {
      await createNotification(
        user.id,
        "LINK_EMAIL",
        undefined,
        undefined,
        user.notifications
      );
    }
    if (!user.name || !user.avatarURL) {
      await createNotification(
        user.id,
        "COMPLETE_PROFILE",
        undefined,
        undefined,
        user.notifications
      );
    }
  }
}
async function createUserAchievements(user: ExtendedUser) {
  if (user.userType === "tipper") {
    await createAchievement(user.id, "BECAME_TIPPER", user.achievements);
    if (user.email) {
      await createAchievement(user.id, "LINKED_EMAIL", user.achievements);
    }
    if (user.lnurlPublicKey) {
      await createAchievement(user.id, "LINKED_WALLET", user.achievements);
    }
    if (user.name) {
      await createAchievement(user.id, "SET_NAME", user.achievements);
    }
    if (user.avatarURL) {
      await createAchievement(user.id, "SET_AVATAR_URL", user.achievements);
    }
    if (user.lightningAddress) {
      await createAchievement(
        user.id,
        "SET_LIGHTNING_ADDRESS",
        user.achievements
      );
    }
  }
}
