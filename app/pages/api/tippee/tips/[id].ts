import { StatusCodes } from "http-status-codes";
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
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}
async function getTip(req: NextApiRequest, res: NextApiResponse<PublicTip>) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!tip) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  // only return public fields since this is a public page
  const unclaimedTip: PublicTip = {
    amount: tip.amount,
    tipperId: tip.tipperId,
    hasClaimed: !!tip.tippeeId,
    currency: tip.currency,
  };

  res.status(StatusCodes.OK).json(unclaimedTip);
}
