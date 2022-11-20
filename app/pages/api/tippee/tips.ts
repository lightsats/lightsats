import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { mapTipToPublicTip } from "lib/mapTipToPublicTip";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { PublicTip } from "types/PublicTip";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[] | PublicTip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }
  const { publicTip } = req.query;

  switch (req.method) {
    case "GET":
      if (publicTip === "true") {
        return getPublicTips(session, req, res);
      }
      return getTips(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function getPublicTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<PublicTip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tippeeId: {
        equals: session.user.id,
      },
    },
    include: {
      tipper: true,
      tippee: true,
    },
    orderBy: {
      created: "desc",
    },
  });

  res.status(StatusCodes.OK).json(tips.map(mapTipToPublicTip));
}

async function getTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tippeeId: {
        equals: session.user.id,
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  res.status(StatusCodes.OK).json(tips);
}
