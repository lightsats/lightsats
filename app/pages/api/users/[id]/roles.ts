import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserRole[]>
) {
  if (req.method !== "GET") {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  const session = await unstable_getServerSession(req, res, authOptions);

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
