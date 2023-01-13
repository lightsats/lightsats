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

  switch (req.method) {
    case "POST":
      return handleMarkTipCopied(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handleMarkTipCopied(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<never>
) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tip.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }

  await prisma.tip.update({
    where: {
      id: tip.id,
    },
    data: {
      copiedClaimUrl: new Date(),
    },
  });

  return res.status(StatusCodes.NO_CONTENT).end();
}
