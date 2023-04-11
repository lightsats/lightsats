import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminExtendedWithdrawalError } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedWithdrawalError>
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
      tip: true,
    },
  });

  if (!withdrawalError) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  return res.json(withdrawalError);
}
