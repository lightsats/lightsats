import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const { id } = req.query;
  if (session.user.id !== id) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  if (req.method === "DELETE") {
    return deleteApiKey(session, req, res);
  }
  return res.status(StatusCodes.NOT_FOUND).end();
}

async function deleteApiKey(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { key } = req.query;

  const apiKey = await prisma.userAPIKey.findUnique({
    where: {
      id: key as string,
    },
  });
  if (!apiKey || session.user.id !== apiKey.userId) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  await prisma.userAPIKey.delete({
    where: {
      id: key as string,
    },
  });
  return res.status(StatusCodes.NO_CONTENT).end();
}
