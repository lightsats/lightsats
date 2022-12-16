import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip[]>
) {
  switch (req.method) {
    case "GET":
      return getTips(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function getTips(req: NextApiRequest, res: NextApiResponse<Tip[]>) {
  const { tipId } = req.query;

  const tip = await prisma.tip.findUnique({
    where: {
      id: tipId as string,
    },
  });

  if (!tip || !tip.skipOnboarding) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.status(StatusCodes.OK).json([tip]);
}
