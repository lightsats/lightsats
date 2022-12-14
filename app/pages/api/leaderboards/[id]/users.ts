// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { LeaderboardUser } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeaderboardUser[]>
) {
  if (req.method !== "GET") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  const { id } = req.query;
  const leaderboardUsers = await prisma.leaderboardUser.findMany({
    where: {
      leaderboardId: id as string,
    },
  });
  return res.json(leaderboardUsers);
}
