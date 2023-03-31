import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserRole[]>
) {
  if (req.method !== "GET") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const session = await getLightsatsServerSession(req, res);

  const { id } = req.query;

  if (session?.user.id !== id) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  const roles = await prisma.userRole.findMany({
    where: {
      userId: id as string,
    },
  });

  return res.json(roles);
}
