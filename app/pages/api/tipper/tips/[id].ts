import type { NextApiRequest, NextApiResponse } from "next";
import { Tip } from "@prisma/client";
import prisma from "../../../../lib/prismadb";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { assert } from "console";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(401).end();
    return;
  }

  switch (req.method) {
    case "GET":
      return getTip(session, req, res);
    default:
      res.status(404).end();
      return;
  }
}
async function getTip(
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

  res.status(200).json(tip);
}
