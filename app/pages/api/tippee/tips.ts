import type { NextApiRequest, NextApiResponse } from "next";
import { Tip } from "@prisma/client";
import prisma from "../../../lib/prismadb";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { StatusCodes } from "http-status-codes";

type CreateInvoiceRequest = {
  out: false;
  amount: number;
  memo: string;
  webhook: string;
};

type CreateInvoiceResponse = {
  payment_hash: string;
  payment_request: string;
};

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
    case "GET":
      return getTips(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
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
  });

  res.status(StatusCodes.OK).json(tips);
}
