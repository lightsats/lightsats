import { User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import prisma from "lib/prismadb";
import { getFallbackAvatarId } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { PublicUser } from "types/PublicUser";
import { UpdateUserRequest } from "types/UpdateUserRequest";

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
        },
      });
      if (!user) {
        res.status(StatusCodes.NOT_FOUND).end();
        return;
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
        ...(user.isAnonymous &&
        (forceAnonymous === "true" || user.id !== session?.user.id)
          ? {
              name: null,
              avatarURL: null,
              twitterUsername: null,
              lightningAddress: null,
            }
          : {
              name: user.name,
              avatarURL: user.avatarURL,
              twitterUsername: user.twitterUsername,
              lightningAddress: user.lightningAddress,
            }),
        fallbackAvatarId: getFallbackAvatarId(user),
        numTipsSent: sentTips.length,
        numTipsReceived: user.tipsReceived.length,
        satsTipped: satsTipped,
      };
      return res.json(publicUser);
    }
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  switch (req.method) {
    case "PUT":
      return updateUser(user, req, res);
    case "GET":
      return getUser(user, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
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

  res.status(StatusCodes.NO_CONTENT).end();
}
async function getUser(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  res.status(StatusCodes.OK).json(user);
}
