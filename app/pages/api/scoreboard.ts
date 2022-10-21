// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { ScoreboardEntry } from "types/ScoreboardEntry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScoreboardEntry[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  // TODO: cache scoreboard
  const users = await prisma.user.findMany({
    include: {
      tipsSent: true,
    },
  });

  const scoreboardEntries: ScoreboardEntry[] = users
    .filter((user) => user.tipsSent.length > 0)
    .map((user) => {
      const withdrawnTips = user.tipsSent.filter(
        (tip) => tip.status === "WITHDRAWN"
      );
      return {
        isMe: !!session && user.id === session.user.id,
        numTipsWithdrawn: withdrawnTips.length,
        satsSent: withdrawnTips.length
          ? withdrawnTips.map((tip) => tip.amount).reduce((a, b) => a + b)
          : 0,
        successRate: withdrawnTips.length
          ? withdrawnTips.length / user.tipsSent.length
          : 0,
        name: user.name ?? undefined,
        avatarURL: user.avatarURL ?? undefined,
        twitterUsername: user.twitterUsername ?? undefined,
      };
    });

  scoreboardEntries.sort((a, b) => b.satsSent - a.satsSent);

  res.status(StatusCodes.OK).json(scoreboardEntries);
}
