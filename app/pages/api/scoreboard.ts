// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import { getFallbackAvatarId } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { Scoreboard } from "types/Scoreboard";
import { ScoreboardEntry } from "types/ScoreboardEntry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Scoreboard>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  // TODO: cache scoreboard
  const users = await prisma.user.findMany({
    include: {
      tipsSent: true,
      tipsReceived: true,
    },
  });

  const entries: ScoreboardEntry[] = users
    .filter((user) => user.tipsSent.length > 0)
    .map((user) => {
      const withdrawnTips = user.tipsSent.filter(
        (tip) => tip.status === "WITHDRAWN"
      );
      return {
        userId: user.id,
        isMe: !!session && user.id === session.user.id,
        numTipsWithdrawn: withdrawnTips.length,
        satsSent: withdrawnTips.length
          ? withdrawnTips.map((tip) => tip.amount).reduce((a, b) => a + b)
          : 0,
        numTipsSent: user.tipsSent.length,
        successRate: withdrawnTips.length
          ? withdrawnTips.length / user.tipsSent.length
          : 0,
        ...(user.isAnonymous
          ? {
              name: undefined,
              avatarURL: undefined,
              twitterUsername: undefined,
            }
          : {
              name: user.name ?? undefined,
              avatarURL: user.avatarURL ?? undefined,
              twitterUsername: user.twitterUsername ?? undefined,
            }),
        fallbackAvatarId: getFallbackAvatarId(user),
      };
    });

  entries.sort((a, b) => b.satsSent - a.satsSent);

  const numUsersOnboarded = users.filter((user) =>
    user.tipsReceived.some((tip) => tip.status === "WITHDRAWN")
  ).length;

  const numTippers = users.filter((user) => user.tipsSent.length > 0).length;

  const scoreboard: Scoreboard = {
    entries,
    numTippers,
    numUsersOnboarded,
    numTipsSent: entries.map((e) => e.numTipsSent).reduce((a, b) => a + b),
    totalSatsSent: entries.map((e) => e.satsSent).reduce((a, b) => a + b),
  };

  res.status(StatusCodes.OK).json(scoreboard);
}
