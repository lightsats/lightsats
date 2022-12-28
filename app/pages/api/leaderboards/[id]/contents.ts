// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Leaderboard, Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { cacheRequest } from "lib/cacheRequest";
import { DEFAULT_LEADERBOARD_ID, LIGHTSATS_INCEPTION } from "lib/constants";
import { createAchievement } from "lib/createAchievement";
import prisma from "lib/prismadb";
import { getFallbackAvatarId } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { LeaderboardContents } from "types/LeaderboardContents";
import { LeaderboardEntry } from "types/LeaderboardEntry";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardContents>
) {
  if (req.method !== "GET") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  const { id } = req.query;
  if (!id || id.length > 255) {
    throw new Error("Invalid leaderboard ID field");
  }
  const leaderboardContents = await cacheRequest(
    "leaderboardContents",
    id as string,
    () => getLeaderboardContents(id as string),
    15
  );
  if (!leaderboardContents) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  return res.json(leaderboardContents);
}

async function getLeaderboardContents(
  leaderboardId: string
): Promise<LeaderboardContents | undefined> {
  let leaderboard: Leaderboard | null = null;
  if (leaderboardId !== DEFAULT_LEADERBOARD_ID) {
    leaderboard = await prisma.leaderboard.findUnique({
      where: {
        id: leaderboardId,
      },
    });
    if (!leaderboard) {
      return undefined;
    }
  }

  const startDate = leaderboard?.start ?? LIGHTSATS_INCEPTION;
  const endDate = leaderboard?.end ?? new Date();
  // const isGlobal = leaderboard?.global ?? true;

  // TODO: for non-global scoreboards, find users matching leaderboard
  const users = await prisma.user.findMany({
    where:
      leaderboard && !leaderboard.global
        ? {
            leaderboardUsers: {
              some: {
                leaderboardId: leaderboard.id,
              },
            },
          }
        : undefined,
    include: {
      tipsSent: true,
      tipsReceived: true,
      achievements: true,
    },
  });

  if (leaderboardId === DEFAULT_LEADERBOARD_ID) {
    let userWithMostWithdrawnSentTips: typeof users[number] | undefined =
      undefined;
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
  }

  const isTipInPeriod = (tip: Tip) =>
    tip.created > startDate && tip.created < endDate;
  const getSentTipsInPeriod = (user: typeof users[number]) =>
    user.tipsSent.filter((tip) => isTipInPeriod(tip));
  const getSentWithdrawnTipsInPeriod = (user: typeof users[number]) =>
    user.tipsSent.filter(
      (tip) =>
        isTipInPeriod(tip) &&
        tip.status === "WITHDRAWN" &&
        ((tip.claimed && tip.claimed > startDate && tip.claimed < endDate) ||
          (tip.lastWithdrawal /* anonymous withdrawal is not claimed */ &&
            tip.lastWithdrawal > startDate &&
            tip.lastWithdrawal < endDate))
    );

  const entries: LeaderboardEntry[] = users
    .filter((user) => getSentWithdrawnTipsInPeriod(user).length > 0)
    .map((user) => {
      const userSentTips = getSentTipsInPeriod(user);
      const userSentWithdrawnTips = getSentWithdrawnTipsInPeriod(user);
      return {
        userId: user.id,
        numTipsWithdrawn: userSentWithdrawnTips.length,
        satsSent: userSentWithdrawnTips.length
          ? userSentWithdrawnTips
              .map((tip) => tip.amount)
              .reduce((a, b) => a + b)
          : 0,
        numTipsSent: userSentTips.length,
        successRate: userSentWithdrawnTips.length
          ? userSentWithdrawnTips.length / userSentTips.length
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

  if (leaderboardId === DEFAULT_LEADERBOARD_ID) {
    for (const category of [10, 3, 1] as const) {
      for (let i = 0; i < category && i < entries.length; i++) {
        await createAchievement(
          entries[i].userId,
          `TOP_${category}`,
          users.find((user) => user.id === entries[i].userId)?.achievements
        );
      }
    }
  }

  // TODO: improve this check - it should be the user's first withdrawn tip?
  const numUsersOnboarded = users.filter((user) =>
    user.tipsReceived.some(
      (tip) => tip.status === "WITHDRAWN" && isTipInPeriod(tip)
    )
  ).length;

  const leaderboardContents: LeaderboardContents = {
    entries: entries,
    numTippers: entries.length,
    numUsersOnboarded,
    numTipsSent: entries.length
      ? entries.map((e) => e.numTipsSent).reduce((a, b) => a + b)
      : 0,
    totalSatsSent: entries.length
      ? entries.map((e) => e.satsSent).reduce((a, b) => a + b)
      : 0,
  };

  return leaderboardContents;
}
