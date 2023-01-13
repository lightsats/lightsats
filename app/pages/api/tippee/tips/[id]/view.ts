import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  switch (req.method) {
    case "POST":
      return handleViewTip(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleViewTip(req: NextApiRequest, res: NextApiResponse<Tip>) {
  const { id } = req.query;
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      claimLinkViewed: true,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
