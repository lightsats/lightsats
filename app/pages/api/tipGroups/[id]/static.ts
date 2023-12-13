import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { StaticTipRedirect } from "types/StaticTipRedirect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StaticTipRedirect>
) {
  switch (req.method) {
    case "GET":
      return getTip(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTip(
  req: NextApiRequest,
  res: NextApiResponse<StaticTipRedirect>
) {
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

  if (!tipGroup) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const result: StaticTipRedirect = {
    tippeeLocale: tipGroup.tips[0].tippeeLocale ?? undefined,
  };

  if (tipGroup.enableStaticLink) {
    // only allow a tippee to claim at most one tip from the group
    // prioritize unseen tips, then seen tips
    const tip =
      (session &&
        tipGroup.tips.find((tip) => tip.tippeeId === session.user.id)) ||
      tipGroup.tips.find((tip) => tip.status === "UNSEEN") ||
      tipGroup.tips.find((tip) => tip.status === "SEEN");

    result.tipId = tip?.id;
  }

  return res.json(result);
}
