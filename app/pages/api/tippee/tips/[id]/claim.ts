import type { NextApiRequest, NextApiResponse } from "next";
import { Tip } from "@prisma/client";
import prisma from "../../../../../lib/prismadb";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handleClaimTip(session, req, res);
    default:
      res.status(404).end();
      return;
  }
}

async function handleClaimTip(
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
    res.status(404).end();
    return;
  }
  if (tip.tippeeId || session.user.id === tip.tipperId) {
    // already claimed or trying to claim their own tip
    res.status(409).end();
    return;
  }
  await prisma.tip.update({
    where: {
      id: id as string,
    },
    data: {
      status: "CLAIMED",
      tippeeId: session.user.id,
    },
  });
  res.status(204).end();
}
