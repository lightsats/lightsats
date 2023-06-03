import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { DEFAULT_NAME } from "lib/constants";
import prisma from "lib/prismadb";
import { getUpdatedPassphrase } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSharedUpdateTipFields } from "pages/api/tipper/tips/[id]";
import { TipGroupWithTips } from "types/TipGroupWithTips";
import { TipRequestBase, UpdateTipsRequest } from "types/TipRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  const session = await getLightsatsServerSession(req, res);
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

  await prisma.tipGroup.update({
    where: {
      id: tipGroup.id,
    },
    data: {
      enableStaticLink: updateTipsRequest.enableStaticLink,
    },
  });

  await prisma.tip.updateMany({
    where: {
      groupId: tipGroup.id,
    },
    data: {
      ...getSharedUpdateTipFields(updateTipsRequest),
    },
  });

  for (let i = 0; i < tipGroup.tips.length; i++) {
    await prisma.tip.update({
      where: {
        id: tipGroup.tips[i].id,
      },
      data: {
        ...getTemplatedGroupTipProperties(updateTipsRequest, i),
        passphrase: getUpdatedPassphrase(
          tipGroup.tips[i].passphrase,
          updateTipsRequest
        ),
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

export function getTemplatedGroupTipProperties(
  tipRequest: TipRequestBase,
  index: number
) {
  const tippeeNameTemplate =
    tipRequest.tippeeNames?.length === 1
      ? tipRequest.tippeeNames[0]
      : undefined;

  const tippeeName = tippeeNameTemplate
    ? tippeeNameTemplate.replaceAll("{{index}}", (index + 1).toString())
    : tipRequest.tippeeNames?.[index] ?? null;
  const note =
    tipRequest.note?.replaceAll("{{name}}", tippeeName ?? DEFAULT_NAME) ?? null;

  return {
    tippeeName,
    note,
  };
}
