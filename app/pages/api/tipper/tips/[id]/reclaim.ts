import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { refundableTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handleReclaimTip(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleReclaimTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const { id } = req.query;
  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!tip) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }
  if (session.user.id !== tip.tipperId) {
    res.status(StatusCodes.FORBIDDEN).end();
    return;
  }
  if (refundableTipStatuses.indexOf(tip.status) < 0) {
    res.status(StatusCodes.CONFLICT).end();
    return;
  }
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      status: "RECLAIMED",
      tippeeId: session.user.id,
    },
  });
  res.status(204).end();
}
