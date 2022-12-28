// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { LeaderboardUser } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardUser[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
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
