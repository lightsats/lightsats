import { TipGroupStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { checkTipGroupHasBeenFunded } from "lib/checkTipGroupHasBeenFunded";
import { deleteLnbitsUser } from "lib/lnbits/deleteLnbitsUser";
import { prepareTipGroupTips } from "lib/prepareTipGroupTips";
import prisma from "lib/prismadb";
import { regenerateExpiredTipGroupInvoice } from "lib/regenerateExpiredTipGroupInvoice";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
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
        orderBy: {
          groupTipIndex: "asc",
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
    case "GET":
      return getTipGroup(tipGroup, req, res);
    case "DELETE":
      return deleteTipGroup(tipGroup, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getTipGroup(
  tipGroup: TipGroupWithTips,
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  // FIXME: this should be in a separate endpoint (GET should be idempotent)
  // currently used to check if the tip has been funded yet (polled on the tip group page)
  await checkTipGroupHasBeenFunded(tipGroup);
  await regenerateExpiredTipGroupInvoice(tipGroup);
  await prepareTipGroupTips(tipGroup);

  return res.json(tipGroup);
}

async function deleteTipGroup(
  tipGroup: TipGroupWithTips,
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  if (tipGroup.status !== TipGroupStatus.UNFUNDED) {
    return res.status(StatusCodes.CONFLICT).end();
  }

  const lnbitsWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipGroupId: tipGroup.id,
    },
  });
  if (lnbitsWallet) {
    await deleteLnbitsUser(lnbitsWallet.lnbitsUserId);
  } else {
    console.warn("No lnbits user+wallet for tip group " + tipGroup.id);
  }

  await prisma.tip.deleteMany({
    where: {
      groupId: tipGroup.id,
    },
  });
  await prisma.tipGroup.delete({
    where: {
      id: tipGroup.id,
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
