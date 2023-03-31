import { sub } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { deleteUnusedWithdrawalLinks } from "lib/deleteStaleWithdrawalLinks";
import { getWithdrawalLinkUrl } from "lib/lnurl/getWithdrawalLinkUrl";
import prisma from "lib/prismadb";
import { checkWithdrawalFlow, getWithdrawableTipsQuery } from "lib/withdrawal";
import * as lnurl from "lnurl";
import type { NextApiRequest, NextApiResponse } from "next";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return postWithdrawLink(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function postWithdrawLink(req: NextApiRequest, res: NextApiResponse) {
  const withdrawalRequest = req.body as LnurlWithdrawalRequest;
  checkWithdrawalFlow(withdrawalRequest.flow);

  const session = await getLightsatsServerSession(req, res);

  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(
      withdrawalRequest.flow,
      session?.user.id,
      withdrawalRequest.tipId
    ),
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

  const userId =
    withdrawalRequest.flow === "anonymous" ? undefined : session?.user.id;

  if (withdrawalRequest.flow === "anonymous") {
    const tipWallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipId: withdrawalRequest.tipId,
      },
    });
    if (!tipWallet) {
      throw new Error(
        "Tip " + withdrawalRequest.tipId + " has no staging wallet"
      );
    }
  } else {
    if (!session) {
      throw new Error("User is not logged in");
    }
    const userWallet = await prisma.lnbitsWallet.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    if (!userWallet) {
      throw new Error("User " + session.user.id + " has no staging wallet");
    }
  }
  await deleteUnusedWithdrawalLinks(userId, withdrawalRequest.tipId, true);

  const existingWithdrawLink = await prisma.withdrawalLink.findFirst({
    where: {
      userId,
      tipId: withdrawalRequest.tipId,
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
    return res.json(existingWithdrawLink.lnurl);
  }

  const withdrawalLinkId: string = uuidv4();
  const lnurlValue = lnurl.encode(getWithdrawalLinkUrl(withdrawalLinkId));

  await prisma.withdrawalLink.create({
    data: {
      id: withdrawalLinkId,
      lnurl: lnurlValue,
      userId,
      tipId: withdrawalRequest.tipId,
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

  return res.json(lnurlValue);
}
