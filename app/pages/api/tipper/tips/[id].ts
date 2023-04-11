import { Tip, TipStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { checkTipHasBeenFunded } from "lib/checkTipHasBeenFunded";
import { deleteLnbitsUser } from "lib/lnbits/deleteLnbitsUser";
import prisma from "lib/prismadb";
import { regenerateExpiredTipInvoice } from "lib/regenerateExpiredTipInvoice";
import { getUpdatedPassphrase } from "lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { TipRequestBase, UpdateTipRequest } from "types/TipRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tip.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "GET":
      return getTip(tip, req, res);
    case "DELETE":
      return deleteTip(tip, req, res);
    case "PUT":
      return updateTip(tip, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function deleteTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  if (tip.groupId) {
    throw new Error("Tips in groups cannot be individually deleted");
  }

  if (tip.status !== TipStatus.UNFUNDED) {
    return res.status(StatusCodes.CONFLICT).end();
  }

  const lnbitsWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipId: tip.id,
    },
  });
  if (lnbitsWallet) {
    await deleteLnbitsUser(lnbitsWallet.lnbitsUserId);
  } else {
    console.warn("No lnbits user+wallet for tip " + tip.id);
  }

  await prisma.tip.delete({
    where: {
      id: tip.id,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
async function getTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (!tip.groupId) {
    // FIXME: this should be in a separate endpoint (GET should be idempotent)
    // currently used to check if the tip has been funded yet (polled on the tip page)
    tip = await checkTipHasBeenFunded(tip);

    tip = await regenerateExpiredTipInvoice(tip);
  }

  return res.json(tip);
}

async function updateTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const updateTipRequest = req.body as UpdateTipRequest;

  const updatedTip = await prisma.tip.update({
    where: {
      id: tip.id,
    },
    data: {
      ...getSharedUpdateTipFields(updateTipRequest),
      note: updateTipRequest.note || null,
      tippeeName: updateTipRequest.tippeeName || null,
      passphrase: getUpdatedPassphrase(tip.passphrase, updateTipRequest),
    },
  });

  res.json(updatedTip);
}

export function getSharedUpdateTipFields(updateTipRequest: TipRequestBase) {
  return {
    expiry: updateTipRequest.expiry,
    currency: updateTipRequest.currency || null,
    tippeeLocale: updateTipRequest.tippeeLocale || null,
    onboardingFlow: updateTipRequest.onboardingFlow,
    recommendedWalletId: updateTipRequest.recommendedWalletId || null,
    anonymousTipper: updateTipRequest.anonymousTipper,
    claimWebhookUrl: updateTipRequest.claimWebhookUrl || null,
  };
}
