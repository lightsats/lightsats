import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedWithdrawal } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawal>
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
      return handleGetWithdrawal(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetWithdrawal(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawal>
) {
  const { id } = req.query;
  const withdrawal = await prisma.withdrawal.findFirst({
    where: {
      id: id as string,
    },
    include: {
      tips: true,
      user: true,
    },
  });

  if (!withdrawal) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  return res.json(withdrawal);
}
