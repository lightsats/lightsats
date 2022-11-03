import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      roles: true,
    },
  });
  if (!user) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  if (!user.roles.some((role) => role.roleType === "SUPERADMIN")) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }

  switch (req.method) {
    case "GET":
      return handleGetAdminDashboard(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetAdminDashboard(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<AdminDashboard>
) {
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
    tips: await prisma.tip.findMany(),
    withdrawals: await prisma.withdrawal.findMany({
      include: {
        tips: true,
      },
    }),
    lnbitsDashboardUrl: `${process.env.LNBITS_URL}/wallet?usr=${process.env.LNBITS_USER_ID}`,
    users: await prisma.user.findMany(),
  });
}
