import { Leaderboard } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { CreateLeaderboardRequest } from "types/LeaderboardRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard | Leaderboard[]>
) {
  const session = await getLightsatsServerSession(req, res);

  switch (req.method) {
    case "POST":
      return handlePostLeaderboard(session, req, res);
    case "GET":
      return getLeaderboards(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getLeaderboards(
  session: Session | undefined,
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard[]>
) {
  const { userId } = req.query;
  if (userId && session?.user.id !== userId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  const leaderboards = await prisma.leaderboard.findMany({
    where: {
      ...(userId
        ? {
            OR: [
              {
                creatorId: userId as string,
              },
              {
                leaderboardUsers: {
                  some: {
                    userId: userId as string,
                  },
                },
              },
            ],
          }
        : { public: true }),
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.json(leaderboards);
}

async function handlePostLeaderboard(
  session: Session | undefined,
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
      public:
        (await isAdmin(session.user.id)) && createLeaderboardRequest.isPublic,
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
