import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminExtendedTipGroup } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTipGroup>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "GET":
      return handleGetTipGroup(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleGetTipGroup(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTipGroup>
) {
  const { id } = req.query;
  const tipGroup = await prisma.tipGroup.findUnique({
    where: {
      id: id as string,
    },
    include: {
      tips: true,
      tipper: true,
      lnbitsWallet: true,
    },
  });

  if (!tipGroup) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  let walletBalance = 0;
  if (tipGroup.lnbitsWallet) {
    try {
      walletBalance = await getWalletBalance(tipGroup.lnbitsWallet.adminKey);
    } catch (error) {
      console.error(
        "Admin tip: Failed to retrieve wallet balance for tip group " +
          tipGroup.id
      );
    }
  }

  return res.json({
    ...tipGroup,
    lnbitsWalletUrl: tipGroup.lnbitsWallet
      ? `${process.env.LNBITS_URL}/wallet?usr=${tipGroup.lnbitsWallet.lnbitsUserId}`
      : undefined,
    walletBalance,
  });
}
