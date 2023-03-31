import { StatusCodes } from "http-status-codes";
import { isAdmin } from "lib/admin/isAdmin";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { AdminExtendedTip, AdminUserChangeEmailRequest } from "types/Admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminExtendedTip>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  if (!(await isAdmin(session.user.id))) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  switch (req.method) {
    case "POST":
      return handleChangeUserEmail(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleChangeUserEmail(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { id } = req.query;
  const changeEmailRequest = req.body as AdminUserChangeEmailRequest;
  await prisma.user.update({
    where: {
      id: id as string,
    },
    data: {
      email: changeEmailRequest.email,
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
