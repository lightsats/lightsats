import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import { getFallbackAvatarId } from "lib/utils";
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
    include: {
      tipper: true,
      tippee: true,
    },
  });
  if (!tip) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  // only return public fields since this is a public endpoint
  const publicTip: PublicTip = {
    id: tip.id,
    amount: tip.amount,
    tipperId: tip.tipperId,
    hasClaimed: !!tip.tippeeId,
    currency: tip.currency,
    note: tip.note,
    tippeeId: tip.tippeeId,
    tipper: {
      name: tip.tipper.name,
      twitterUsername: tip.tipper.twitterUsername,
      avatarURL: tip.tipper.avatarURL,
      fallbackAvatarId: getFallbackAvatarId(tip.tipper),
    },
    tippee: tip.tippee
      ? {
          inJourney: tip.tippee.inJourney,
          journeyStep: tip.tippee.journeyStep,
          name: tip.tippee.name,
          twitterUsername: tip.tippee.twitterUsername,
          avatarURL: tip.tippee.avatarURL,
          fallbackAvatarId: getFallbackAvatarId(tip.tippee),
        }
      : undefined,
    status: tip.status,
    created: tip.created,
    expiry: tip.expiry,
    tippeeName: tip.tippeeName,
    claimLinkViewed: tip.claimLinkViewed,
  };

  res.status(StatusCodes.OK).json(publicTip);
}
