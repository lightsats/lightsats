// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { StatusCodes } from "http-status-codes";
import { createAchievement } from "lib/createAchievement";
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
      achievements: true,
    },
  });

  let userWithMostWithdrawnSentTips: typeof users[0] | undefined = undefined;
  let highestNumWithdrawnSentTips = 0;
  for (const user of users) {
    const numWithdrawnSentTips = user.tipsSent.filter(
      (tip) => tip.status === "WITHDRAWN"
    ).length;
    if (numWithdrawnSentTips > highestNumWithdrawnSentTips) {
      highestNumWithdrawnSentTips = numWithdrawnSentTips;
      userWithMostWithdrawnSentTips = user;
    }
  }
  if (userWithMostWithdrawnSentTips) {
    await createAchievement(
      userWithMostWithdrawnSentTips.id,
      `MOST_WITHDRAWN_TIPS`,
      userWithMostWithdrawnSentTips.achievements
    );
  }

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
        achievementTypes: user.achievements.map(
          (achievement) => achievement.type
        ),
      };
    });

  entries.sort((a, b) => b.satsSent - a.satsSent);

  for (const category of [10, 3, 1] as const) {
    for (let i = 0; i < category && i < entries.length; i++) {
      await createAchievement(
        entries[i].userId,
        `TOP_${category}`,
        users.find((user) => user.id === entries[i].userId)?.achievements
      );
    }
  }

  const numUsersOnboarded = users.filter((user) =>
    user.tipsReceived.some((tip) => tip.status === "WITHDRAWN")
  ).length;

  const numTippers = users.filter((user) => user.tipsSent.length > 0).length;

  const scoreboard: Scoreboard = {
    entries: entries,
    numTippers,
    numUsersOnboarded,
    numTipsSent: entries.length
      ? entries.map((e) => e.numTipsSent).reduce((a, b) => a + b)
      : 0,
    totalSatsSent: entries.length
      ? entries.map((e) => e.satsSent).reduce((a, b) => a + b)
      : 0,
  };

  return res.status(StatusCodes.OK).json(scoreboard);
}
