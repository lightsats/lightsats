import { StatusCodes } from "http-status-codes";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import { markTipAsUnclaimed } from "lib/markTipAsUnclaimed";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
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

  switch (req.method) {
    case "POST":
      return handlePrepareTip(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handlePrepareTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<TipGroupWithTips>
) {
  const { id, tipId } = req.query;

  const tipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: id as string,
    },
    include: {
      lnbitsWallet: true,
    },
  });

  const tip = await prisma.tip.findUnique({
    where: {
      id: tipId as string,
    },
  });
  if (!tipGroup || !tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  if (!tipGroup.lnbitsWallet) {
    throw new Error("Tip group " + tipGroup.id + " has not lnbits wallet");
  }

  if (
    session.user.id !== tipGroup.tipperId ||
    session.user.id !== tip.tipperId
  ) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  // FIXME: this could create multiple wallets in lnbits if this function is called multiple times
  // However, the Lightsats LnbitsWallet entry can only be created once due to unique constraint on tipId
  const tipLnbitsWalletAdminKey = await prepareFundingWallet(tip.id, undefined);

  const { invoice } = await createInvoice(
    tip.amount + tip.fee,
    tipLnbitsWalletAdminKey,
    "Fund tip from group wallet",
    undefined
  );
  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    invoice,
    tipGroup.lnbitsWallet.adminKey
  );
  if (!payInvoiceResponse.ok) {
    throw new Error(
      "Failed to pay tip group " +
        tipGroup.id +
        " invoice: " +
        payInvoiceResponse.status +
        " " +
        payInvoiceResponse.statusText +
        " " +
        JSON.stringify(payInvoiceResponseBody)
    );
  }

  await markTipAsUnclaimed(tip);

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
