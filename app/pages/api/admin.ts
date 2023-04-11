import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import prisma from "lib/prismadb";
import { getSmsForSatsAccountBalance } from "lib/sms/SmsForSatsAccountProvider";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminDashboard } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
      return handleGetAdminDashboard(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
    lnbitsDashboardUrl: `${process.env.LNBITS_URL}/wallet?usr=${process.env.LNBITS_USER_ID}`,
    walletBalance,
    smsForSatsAccountBalance,
  });
}
