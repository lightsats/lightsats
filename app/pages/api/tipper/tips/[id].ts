import { Tip, TipStatus } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { checkTipHasBeenFunded } from "lib/checkTipHasBeenFunded";
import prisma from "lib/prismadb";
import { regenerateExpiredTipInvoice } from "lib/regenerateExpiredTipInvoice";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { UpdateTipRequest } from "types/TipRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
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
    case "DELETE":
      return deleteTip(tip, req, res);
    case "GET":
      return getTip(tip, req, res);
    case "PUT":
      return updateTip(tip, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function deleteTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  if (tip.status === TipStatus.UNFUNDED) {
    const lnbitsWallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipId: tip.id,
      },
    });
    if (lnbitsWallet) {
      const deleteWalletRequestHeaders = new Headers();
      deleteWalletRequestHeaders.append(
        "X-Api-Key",
        process.env.LNBITS_API_KEY
      );

      const deleteLnbitsUserResponse = await fetch(
        `${process.env.LNBITS_URL}/usermanager/api/v1/users/${lnbitsWallet.lnbitsUserId}`,
        {
          method: "DELETE",
          headers: deleteWalletRequestHeaders,
        }
      );
      console.log(
        "Tip",
        tip.id,
        "Delete tip lnbits user + wallet response: ",
        deleteLnbitsUserResponse.status,
        deleteLnbitsUserResponse.statusText
      );
    } else {
      console.warn("No lnbits user+wallet for tip " + tip.id);
    }

    await prisma.tip.delete({
      where: {
        id: tip.id,
      },
    });
  }

  return res.status(StatusCodes.NO_CONTENT).end();
}
async function getTip(
  tip: Tip,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  // FIXME: this should be in a separate endpoint (GET should be idempotent)
  // currently used to check if the tip has been funded yet (polled on the tip page)
  tip = await checkTipHasBeenFunded(tip);

  tip = await regenerateExpiredTipInvoice(tip);

  return res.status(StatusCodes.OK).json(tip);
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
      expiry: updateTipRequest.expiry,
      currency: updateTipRequest.currency,
      note: updateTipRequest.note,
      tippeeName: updateTipRequest.tippeeName,
      tippeeLocale: updateTipRequest.tippeeLocale,
    },
  });

  res.json(updatedTip);
}
