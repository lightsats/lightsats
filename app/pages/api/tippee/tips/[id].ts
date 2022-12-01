import { StatusCodes } from "http-status-codes";
import { mapTipToPublicTip } from "lib/mapTipToPublicTip";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { PublicTip } from "types/PublicTip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicTip>
) {
  switch (req.method) {
    case "GET":
      return getTip(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTip(req: NextApiRequest, res: NextApiResponse<PublicTip>) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
    include: {
      tipper: true,
      tippee: true,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.status(StatusCodes.OK).json(mapTipToPublicTip(tip));
}
