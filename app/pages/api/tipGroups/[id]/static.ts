import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
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
  const session = await getLightsatsServerSession(req, res);

  const tipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: req.query.id as string,
    },
    include: {
      tips: {
        include: {
          tippee: true,
          tipper: true,
        },
      },
    },
  });

  if (!tipGroup?.enableStaticLink) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  // only allow a tippee to claim at most one tip from the group
  // prioritize unseen tips, then seen tips
  const tip =
    (session &&
      tipGroup.tips.find((tip) => tip.tippeeId === session.user.id)) ||
    tipGroup.tips.find((tip) => tip.status === "UNSEEN") ||
    tipGroup.tips.find((tip) => tip.status === "SEEN");

  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.json(mapTipToPublicTip(tip));
}
