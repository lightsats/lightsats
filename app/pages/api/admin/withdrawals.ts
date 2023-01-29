import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedWithdrawal } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "GET":
      return handleGetWithdrawals(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleGetWithdrawals(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawal[]>
) {
  return res.json(
    await prisma.withdrawal.findMany({
      include: {
        tips: true,
        user: true,
      },
      orderBy: {
        created: "desc",
      },
    })
  );
}
