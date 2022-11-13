import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedTip } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  if (!isAdmin(session.user.id)) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }

  switch (req.method) {
    case "GET":
      return handleGetTip(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetTip(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
) {
  const { id } = req.query;
  const tip = await prisma.tip.findFirst({
    where: {
      id: id as string,
    },
    include: {
      tippee: true,
      tipper: true,
      withdrawal: {
        include: {
          user: true,
        },
      },
      lnbitsWallet: true,
    },
  });

  if (!tip) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  let walletBalance = 0;
  if (tip.lnbitsWallet) {
    try {
      walletBalance = await getWalletBalance(tip.lnbitsWallet.adminKey);
    } catch (error) {
      console.error(
        "Admin tip: Failed to retrieve wallet balance for tip " + tip.id
      );
    }
  }

  return res.json({
    ...tip,
    lnbitsWalletUrl: tip.lnbitsWallet
      ? `${process.env.LNBITS_URL}/wallet?usr=${tip.lnbitsWallet.lnbitsUserId}`
      : undefined,
    walletBalance,
  });
}
