import { sub } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { deleteUnusedWithdrawalLinks } from "lib/deleteStaleWithdrawalLinks";
import { getWithdrawalLinkUrl } from "lib/lnurl/getWithdrawalLinkUrl";
import prisma from "lib/prismadb";
import { checkWithdrawalFlow, getWithdrawableTipsQuery } from "lib/withdrawal";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return postWithdrawLink(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function postWithdrawLink(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const withdrawalRequest = req.body as LnurlWithdrawalRequest;
  checkWithdrawalFlow(withdrawalRequest.flow);

  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(session.user.id, withdrawalRequest.flow),
  });

  if (!tips.length) {
    // no tips to claim
    return res.status(StatusCodes.CONFLICT).end();
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);
  const fee = tips.map((tip) => tip.fee).reduce((a, b) => a + b);

  if (withdrawalRequest.amount !== amount) {
    return res.status(StatusCodes.CONFLICT).end();
  }

  const userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  if (!userWallet) {
    throw new Error("User " + session.user.id + " has no staging wallet");
  }

  await deleteUnusedWithdrawalLinks(session.user.id, true);

  const existingWithdrawLink = await prisma.withdrawalLink.findFirst({
    where: {
      userId: session.user.id,
      used: false,
      withdrawalFlow: withdrawalRequest.flow,
      amount,
      created: {
        gt: sub(new Date(), {
          minutes: 10,
        }),
      },
    },
  });

  if (existingWithdrawLink) {
    return res.status(StatusCodes.OK).json(existingWithdrawLink.lnurl);
  }

  const withdrawalLinkId: string = uuidv4();
  const lnurlValue = lnurl.encode(getWithdrawalLinkUrl(withdrawalLinkId));

  await prisma.withdrawalLink.create({
    data: {
      id: withdrawalLinkId,
      lnurl: lnurlValue,
      userId: session.user.id,
      amount,
      withdrawalFlow: withdrawalRequest.flow,
      fee,
      linkTips: {
        createMany: {
          data: tips.map((tip) => ({
            tipId: tip.id,
          })),
        },
      },
    },
  });

  return res.status(StatusCodes.OK).json(lnurlValue);
}
