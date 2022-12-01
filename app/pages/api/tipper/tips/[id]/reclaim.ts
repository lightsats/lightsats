import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { refundableTipStatuses } from "lib/constants";
import prisma from "lib/prismadb";
import { stageTip } from "lib/stageTip";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handleReclaimTip(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
    include: {
      lnbitsWallet: true,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (session.user.id !== tip.tipperId) {
    return res.status(StatusCodes.FORBIDDEN).end();
  }
  if (refundableTipStatuses.indexOf(tip.status) < 0) {
    return res.status(StatusCodes.CONFLICT).end();
  }
  await stageTip(session.user.id, tip, "tipper");
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      status: "RECLAIMED",
      tippeeId: session.user.id,
    },
  });
  return res.status(204).end();
}
