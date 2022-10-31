import { WithdrawalLink } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { payWithdrawalInvoice } from "lib/payWithdrawalInvoice";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";

type InitiatePayWithdrawalLinkResponse =
  | {
      status: "ERROR";
      reason: string;
    }
  | {
      status: "OK";
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InitiatePayWithdrawalLinkResponse>
) {
  const { id } = req.query;
  const withdrawalLink = await prisma.withdrawalLink.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!withdrawalLink) {
    res.status(StatusCodes.NOT_FOUND).end();
    return;
  }

  switch (req.method) {
    case "GET":
      return initiatePayWithdrawalLink(withdrawalLink, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}
async function initiatePayWithdrawalLink(
  withdrawalLink: WithdrawalLink,
  req: NextApiRequest,
  res: NextApiResponse<InitiatePayWithdrawalLinkResponse>
) {
  const { pr: invoice } = req.query;

  if (!invoice) {
    return res.json({ status: "ERROR", reason: "No invoice provided" });
  }
  if (withdrawalLink.used) {
    return res.json({ status: "ERROR", reason: "This link has been used" });
  }

  // TODO: this should happen in a separate thread
  try {
    await payWithdrawalInvoice(
      withdrawalLink.withdrawalFlow,
      invoice as string,
      withdrawalLink.userId,
      "invoice",
      withdrawalLink.id
    );
    res.json({
      status: "OK",
    });
  } catch (error) {
    res.json({
      status: "ERROR",
      reason:
        "Payment failed - " +
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
  }
}
