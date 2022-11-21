import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedWithdrawalError } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawalError>
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
      return handleGetWithdrawalError(req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleGetWithdrawalError(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawalError>
) {
  const { id } = req.query;
  const withdrawalError = await prisma.withdrawalError.findFirst({
    where: {
      id: id as string,
    },
    include: {
      user: true,
    },
  });

  if (!withdrawalError) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  return res.json(withdrawalError);
}
