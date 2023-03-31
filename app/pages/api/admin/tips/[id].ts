import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminExtendedTip } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
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
      return handleGetTip(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
      sentReminders: true,
      group: {
        include: {
          tips: true,
        },
      },
      withdrawal: {
        include: {
          user: true,
          tips: true,
        },
      },
      withdrawalErrors: {
        include: {
          tip: true,
          user: true,
        },
      },
      lnbitsWallet: true,
    },
  });

  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
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
