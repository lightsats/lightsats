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
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "GET":
      return handleGetWithdrawal(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.json(withdrawal);
}
