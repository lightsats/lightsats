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
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!isAdmin(session.user.id)) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "GET":
      return handleGetWithdrawalError(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.json(withdrawalError);
}
