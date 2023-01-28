import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { AdminExtendedTip, AdminTipChangeStatusRequest } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "POST":
      return handleChangeTipStatus(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleChangeTipStatus(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
) {
  const { id } = req.query;
  const changeStatusRequest = req.body as AdminTipChangeStatusRequest;
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      status: changeStatusRequest.status,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
