import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { unclaimedTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminLnbitsMigrationTips } from "types/Admin";

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
      return handleGetLnbitsMigrationTips(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleGetLnbitsMigrationTips(
  req: NextApiRequest,
  res: NextApiResponse<AdminLnbitsMigrationTips>
) {
  return res.json({
    tips: process.env.LNBITS_MIGRATION_DATE
      ? await prisma.tip.findMany({
          where: {
            type: {
              notIn: ["NON_CUSTODIAL_NWC"],
            },
            status: {
              in: unclaimedTipStatuses,
            },
            OR: [
              {
                lnbitsWallet: {
                  is: null,
                },
              },
              {
                lnbitsWallet: {
                  created: {
                    lt: new Date(process.env.LNBITS_MIGRATION_DATE),
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
        })
      : [],
    lnbitsMigrationDate: process.env.LNBITS_MIGRATION_DATE,
  });
}
