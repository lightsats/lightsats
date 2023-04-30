import { Tip } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { completeWithdrawal } from "lib/completeWithdrawal";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { MarkNonCustodialTipWithdrawnRequest } from "types/MarkNonCustodialTipWithdrawnRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  switch (req.method) {
    case "POST":
      return handleMarkWithdrawn(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

// mark a non-custodial tip as withdrawn
async function handleMarkWithdrawn(
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  const { id } = req.query;
  const body = req.body as MarkNonCustodialTipWithdrawnRequest;

  const tip = await prisma.tip.findUnique({
    where: {
      id: id as string,
    },
    include: {
      tipper: true,
    },
  });
  if (!tip) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }
  if (tip.type === "CUSTODIAL") {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  const session = await getLightsatsServerSession(req, res);
  const isAnonymous = tip.onboardingFlow === "SKIP";
  const userId = isAnonymous ? undefined : session?.user.id;
  if (!userId && tip.onboardingFlow !== "SKIP") {
    return res.status(StatusCodes.BAD_REQUEST).end();
  }

  await completeWithdrawal(
    userId,
    userId ? undefined : tip.id,
    isAnonymous ? "anonymous" : "tippee",
    undefined,
    0,
    undefined,
    body.invoice,
    body.withdrawalMethod,
    [tip],
    body.withdrawalMethod === "lnurlw",
    undefined
  );
  return res.status(StatusCodes.NO_CONTENT).end();
}
