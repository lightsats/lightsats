import { sub } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { appName } from "lib/constants";
import { createWithdrawLink } from "lib/lnbits/createWithdrawLink";
import prisma from "lib/prismadb";
import { generateAlphanumeric } from "lib/utils";
import { checkWithdrawalFlow, getWithdrawableTipsQuery } from "lib/withdrawal";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { LnurlWithdrawalRequest } from "types/LnurlWithdrawalRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return postWithdrawLink(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
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
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);
  const fee = tips.map((tip) => tip.fee).reduce((a, b) => a + b);

  if (withdrawalRequest.amount !== amount) {
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  const userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  if (!userWallet) {
    throw new Error("User " + session.user.id + " has no staging wallet");
  }

  const existingWithdrawLink = await prisma.withdrawalLink.findFirst({
    where: {
      userId: session.user.id,
      used: false,
      amount,
      created: {
        gt: sub(new Date(), {
          minutes: 10,
        }),
      },
    },
  });

  if (existingWithdrawLink) {
    res.status(StatusCodes.OK).json(existingWithdrawLink.lnurl);
    return;
  }

  // TODO: consider deleting any unused withdraw links that do not match amount (they are unused and may slow down queries)
  // get a withdraw link and cache it for 10 minutes
  let withdrawalCode: string;
  do {
    withdrawalCode = generateAlphanumeric(5);
  } while (
    await prisma.withdrawalLink.findFirst({
      where: {
        withdrawalCode,
      },
    })
  );

  // Do NOT change the memo value, currently required to associate payments to pay links in lnbits.
  // we need to retrieve the payment from lnbits in order to get the invoice routing fee.
  // The difference between the tip fees for this withdrawal and the invoice routing fee can be
  // moved to the margin wallet.
  const memo = `${appName} withdrawal #${withdrawalCode}`;

  const lnbitsWithdrawLink = await createWithdrawLink(
    amount,
    userWallet.adminKey,
    memo
  );
  await prisma.withdrawalLink.create({
    data: {
      id: lnbitsWithdrawLink.id,
      lnurl: lnbitsWithdrawLink.lnurl,
      userId: session.user.id,
      amount,
      withdrawalCode,
      memo,
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

  res.status(StatusCodes.OK).json(lnbitsWithdrawLink.lnurl);
}
