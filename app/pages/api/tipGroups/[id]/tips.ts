import { StatusCodes } from "http-status-codes";
import { DEFAULT_NAME } from "lib/constants";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { TipGroupWithTips } from "types/TipGroupWithTips";
import { UpdateTipsRequest } from "types/TipRequest";

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
      tips: true,
    },
  });
  if (!tipGroup) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tipGroup.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "PUT":
      return updateTips(tipGroup, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function updateTips(
  tipGroup: TipGroupWithTips,
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  const updateTipsRequest = req.body as UpdateTipsRequest;

  await prisma.tip.updateMany({
    where: {
      groupId: tipGroup.id,
    },
    data: {
      expiry: updateTipsRequest.expiry,
      currency: updateTipsRequest.currency,
      tippeeLocale: updateTipsRequest.tippeeLocale,
      skipOnboarding: updateTipsRequest.skipOnboarding,
    },
  });

  for (let i = 0; i < tipGroup.tips.length; i++) {
    const tippeeName = updateTipsRequest.tippeeNames?.[i] ?? null;
    const note =
      updateTipsRequest.note?.replaceAll(
        "{{name}}",
        tippeeName ?? DEFAULT_NAME
      ) ?? null;

    await prisma.tip.update({
      where: {
        id: tipGroup.tips[i].id,
      },
      data: {
        tippeeName: tippeeName,
        note,
      },
    });
  }

  const updatedTipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: tipGroup.id,
    },
    include: {
      tips: true,
    },
  });

  if (!updatedTipGroup) {
    throw new Error("Failed to retrieve updated tip group: " + tipGroup.id);
  }

  return res.json(updatedTipGroup);
}
