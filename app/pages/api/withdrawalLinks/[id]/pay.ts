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
      "lnurlw",
      withdrawalLink.id
    );

    res.json({
      status: "OK",
    });
  } catch (error) {
    const errorMessage =
      "Failed to pay lnurlw invoice " +
      invoice +
      (withdrawalLink.withdrawalFlow === "anonymous"
        ? " tipId " + withdrawalLink.tipId
        : " userId " + withdrawalLink.userId) +
      " withdrawalLink " +
      withdrawalLink.id +
      ": " +
      JSON.stringify(error, Object.getOwnPropertyNames(error));
    console.error(errorMessage, error);
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId: withdrawalLink.userId ?? undefined,
        tipId: withdrawalLink.tipId ?? undefined,
        withdrawalFlow: withdrawalLink.withdrawalFlow,
        withdrawalMethod: "lnurlw",
        withdrawalInvoice: invoice as string,
      },
    });

    res.json({
      status: "ERROR",
      reason: (error as Error).message,
    });
  }
}
