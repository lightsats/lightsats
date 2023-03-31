// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { LeaderboardUser } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardUser[]>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (req.method !== "POST") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  const { id } = req.query;
  await prisma.leaderboardUser.create({
    data: {
      leaderboardId: id as string,
      userId: session.user.id,
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
