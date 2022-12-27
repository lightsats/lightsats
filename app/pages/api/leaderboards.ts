import { Leaderboard } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { CreateLeaderboardRequest } from "types/LeaderboardRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard | Leaderboard[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  switch (req.method) {
    case "POST":
      return handlePostLeaderboard(session, req, res);
    case "GET":
      return getLeaderboards(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getLeaderboards(
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard[]>
) {
  const leaderboards = await prisma.leaderboard.findMany({
    where: {
      global: true,
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.status(StatusCodes.OK).json(leaderboards);
}

async function handlePostLeaderboard(
  session: Session | null,
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard>
) {
  // TODO: allow non-global leaderboards to be created by users
  if (!session) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  const createLeaderboardRequest = req.body as CreateLeaderboardRequest;

  const leaderboard = await prisma.leaderboard.create({
    data: {
      global:
        (await isAdmin(session.user.id)) && createLeaderboardRequest.isGlobal,
      title: createLeaderboardRequest.title,
      start: new Date(createLeaderboardRequest.startDate),
      end: createLeaderboardRequest.endDate
        ? new Date(createLeaderboardRequest.endDate)
        : null,
      creatorId: session.user.id as string,
      theme: createLeaderboardRequest.theme,
    },
  });

  //await createAchievement(session.user.id, "CREATED_LEADERBOARD");

  res.json(leaderboard);
}
