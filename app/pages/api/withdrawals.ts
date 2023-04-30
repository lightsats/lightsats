import { StatusCodes } from "http-status-codes";
import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import { mapTipToPublicTip } from "lib/mapTipToPublicTip";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { WithdrawalWithPublicTips } from "types/WithdrawalWithPublicTips";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getWithdrawals(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function getWithdrawals(
  req: NextApiRequest,
  res: NextApiResponse<WithdrawalWithPublicTips[]>
) {
  const session = await getLightsatsServerSession(req, res);
  if (!session) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      tips: {
        include: {
          tipper: true,
          tippee: true,
        },
      },
    },
    orderBy: {
      created: "desc",
    },
  });

  return res.json(
    withdrawals.map((withdrawal) => ({
      ...withdrawal,
      tips: withdrawal.tips.map(mapTipToPublicTip),
    }))
  );
}
