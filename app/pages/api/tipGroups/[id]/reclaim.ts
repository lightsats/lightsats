import { TipGroup } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { refundableTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import { reclaimTip } from "lib/reclaimTip";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TipWithWallet } from "types/TipWithWallet";

type TipGroupWithTipsAndTipWallets = TipGroup & {
  tips: TipWithWallet[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }
  const { id } = req.query;
  const tipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: id as string,
    },
    include: {
      tips: {
        include: {
          lnbitsWallet: true,
        },
      },
    },
  });
  if (!tipGroup) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tipGroup.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "POST":
      return handleReclaimTips(tipGroup, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleReclaimTips(
  tipGroup: TipGroupWithTipsAndTipWallets,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const refundableTips = tipGroup.tips.filter(
    (tip) => refundableTipStatuses.indexOf(tip.status) >= 0
  );

  for (const tip of refundableTips) {
    await reclaimTip(tip);
  }

  return res.status(204).end();
}
