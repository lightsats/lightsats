import { WithdrawalLink } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { appName } from "lib/constants";
import { getWithdrawalLinkUrl } from "lib/lnurl/getWithdrawalLinkUrl";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

type GetWithdrawalLinkResponse =
  | {
      status: "ERROR";
      reason: string;
    }
  | {
      tag: "withdrawRequest";
      callback: string;
      k1: string;
      defaultDescription: string;
      minWithdrawable: number;
      maxWithdrawable: number;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetWithdrawalLinkResponse>
) {
  const { id } = req.query;
  const withdrawalLink = await prisma.withdrawalLink.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!withdrawalLink) {
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  switch (req.method) {
    case "GET":
      return getWithdrawalLink(withdrawalLink, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function getWithdrawalLink(
  withdrawalLink: WithdrawalLink,
  req: NextApiRequest,
  res: NextApiResponse<GetWithdrawalLinkResponse>
) {
  if (withdrawalLink.used) {
    return res.json({ status: "ERROR", reason: "This link has been used" });
  } else {
    const minMax = withdrawalLink.amount * 1000; // in millisatoshis
    return res.json({
      tag: "withdrawRequest",
      callback: `${getWithdrawalLinkUrl(withdrawalLink.id)}/pay`, // The URL which LN SERVICE would accept a withdrawal Lightning invoice as query parameter
      k1: "unused",
      defaultDescription: `${appName} withdrawal${
        withdrawalLink.withdrawalFlow === "tippee"
          ? ` - after withdrawing make sure to return to ${process.env.APP_URL} to finish your journey!`
          : ""
      }`, // A default withdrawal invoice description
      minWithdrawable: minMax, // Min amount (in millisatoshis) the user can withdraw from LN SERVICE, or 0
      maxWithdrawable: minMax, // Max amount (in millisatoshis) the user can withdraw from LN SERVICE, or equal to minWithdrawable if the user has no choice over the amounts
    });
  }
}
