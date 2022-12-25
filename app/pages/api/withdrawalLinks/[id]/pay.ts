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
    return res.status(StatusCodes.NOT_FOUND).end();
  }

  switch (req.method) {
    case "GET":
      return initiatePayWithdrawalLink(withdrawalLink, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}
async function initiatePayWithdrawalLink(
  withdrawalLink: WithdrawalLink,
  req: NextApiRequest,
  res: NextApiResponse<InitiatePayWithdrawalLinkResponse>
) {
  if (withdrawalLink.used) {
    return res.json({
      status: "OK",
    });
  }

  const { pr: invoice } = req.query;
  console.log("initiatePayWithdrawalLink", invoice);

  if (!invoice) {
    return res.json({ status: "ERROR", reason: "No invoice provided" });
  }

  // TODO: this should happen in a separate thread
  try {
    await payWithdrawalInvoice(
      withdrawalLink.withdrawalFlow,
      invoice as string,
      withdrawalLink.userId ?? undefined,
      withdrawalLink.tipId ?? undefined,
      "lnurlw"
    );
    res.json({
      status: "OK",
    });
    await prisma.withdrawalLink.update({
      where: {
        id: withdrawalLink.id,
      },
      data: {
        used: true,
      },
    });
  } catch (error) {
    console.error(
      "Failed to pay withdrawal invoice " +
        invoice +
        " withdrawalLink " +
        withdrawalLink.id,
      error
    );
    res.json({
      status: "ERROR",
      reason:
        "Payment failed - " +
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
  }
}
