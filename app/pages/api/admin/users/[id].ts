import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedUser } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedUser>
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
      return handleGetUser(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetUser(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedUser>
) {
  const { id } = req.query;
  const user = await prisma.user.findFirst({
    where: {
      id: id as string,
    },
    include: {
      tipsReceived: {
        orderBy: {
          created: "desc",
        },
      },
      tipsSent: {
        orderBy: {
          created: "desc",
        },
      },
      lnbitsWallet: true,
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  let walletBalance = 0;
  if (user.lnbitsWallet) {
    try {
      walletBalance = await getWalletBalance(user.lnbitsWallet.adminKey);
    } catch (error) {
      console.error(
        "Admin user: Failed to retrieve wallet balance for user " + user.id
      );
    }
  }

  return res.json({
    ...user,
    lnbitsWalletUrl: user.lnbitsWallet
      ? `${process.env.LNBITS_URL}/wallet?usr=${user.lnbitsWallet.lnbitsUserId}`
      : undefined,
    walletBalance,
  });
}
