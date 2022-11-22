import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import { getSmsForSatsAccountBalance } from "lib/sms/SmsForSatsAccountProvider";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminDashboard } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
      return handleGetAdminDashboard(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetAdminDashboard(
  req: NextApiRequest,
  res: NextApiResponse<AdminDashboard>
) {
  let walletBalance = 0;
  if (process.env.LNBITS_API_KEY) {
    try {
      walletBalance = await getWalletBalance(process.env.LNBITS_API_KEY);
    } catch (error) {
      console.error("Admin: Failed to retrieve admin wallet balance");
    }
  }
  let smsForSatsAccountBalance = 0;
  if (process.env.SMS_FOR_SATS_API_KEY) {
    try {
      smsForSatsAccountBalance = await getSmsForSatsAccountBalance();
    } catch (error) {
      console.error("Admin: Failed to retrieve sms4sats account balance");
    }
  }

  return res.json({
    adminUsers: await prisma.user.findMany({
      where: {
        roles: {
          some: {
            roleType: "SUPERADMIN",
          },
        },
      },
    }),
    tips: await prisma.tip.findMany({
      orderBy: {
        created: "desc",
      },
    }),
    withdrawals: await prisma.withdrawal.findMany({
      include: {
        tips: true,
        user: true,
      },
      orderBy: {
        created: "desc",
      },
    }),
    withdrawalErrors: await prisma.withdrawalError.findMany({
      include: {
        user: true,
      },
      orderBy: {
        created: "desc",
      },
    }),
    lnbitsDashboardUrl: `${process.env.LNBITS_URL}/wallet?usr=${process.env.LNBITS_USER_ID}`,
    users: await prisma.user.findMany(),
    walletBalance,
    smsForSatsAccountBalance,
  });
}
