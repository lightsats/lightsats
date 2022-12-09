import { Leaderboard } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

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
