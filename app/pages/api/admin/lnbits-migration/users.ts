import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminLnbitsMigrationUsers } from "types/Admin";

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
      return handleGetLnbitsMigrationUsers(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleGetLnbitsMigrationUsers(
  req: NextApiRequest,
  res: NextApiResponse<AdminLnbitsMigrationUsers>
) {
  return res.json({
    users: process.env.LNBITS_MIGRATION_DATE
      ? await prisma.user.findMany({
          where: {
            lnbitsWallet: {
              created: {
                lt: new Date(process.env.LNBITS_MIGRATION_DATE),
              },
            },
          },
          select: {
            id: true,
          },
        })
      : [],
    lnbitsMigrationDate: process.env.LNBITS_MIGRATION_DATE,
  });
}
