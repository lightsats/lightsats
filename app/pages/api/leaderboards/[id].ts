import { Leaderboard } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { UpdateLeaderboardRequest } from "types/LeaderboardRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard | Leaderboard[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "GET":
      return getLeaderboard(session, req, res);
    case "DELETE":
      return deleteLeaderboard(session, req, res);
    case "PUT":
      return updateLeaderboard(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function getLeaderboard(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard>
) {
  const { id } = req.query;
  const leaderboard = await prisma.leaderboard.findUnique({
    where: {
      id: id as string,
    },
  });

  if (!leaderboard) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.json(leaderboard);
}

async function deleteLeaderboard(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { id } = req.query;
  if (!isAdmin(session.user.id)) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  await prisma.leaderboard.delete({
    where: {
      id: id as string,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}

async function updateLeaderboard(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Leaderboard>
) {
  const { id } = req.query;
  const updateLeaderboardRequest = req.body as UpdateLeaderboardRequest;
  if (!isAdmin(session.user.id)) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  const updatedLeaderboard = await prisma.leaderboard.update({
    where: {
      id: id as string,
    },
    data: {
      title: updateLeaderboardRequest.title,
    },
  });

  return res.json(updatedLeaderboard);
}
