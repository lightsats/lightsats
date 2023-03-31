import { StatusCodes } from "http-status-codes";
import { payWithdrawalInvoice } from "lib/payWithdrawalInvoice";

import { getLightsatsServerSession } from "lib/auth/getLightsatsServerSession";
import prisma from "lib/prismadb";
import { checkWithdrawalFlow } from "lib/withdrawal";
import type { NextApiRequest, NextApiResponse } from "next";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      return handlePayInvoice(req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
  }
}

async function handlePayInvoice(req: NextApiRequest, res: NextApiResponse) {
  const { isWebln } = req.query;
  const withdrawalRequest = req.body as InvoiceWithdrawalRequest;
  checkWithdrawalFlow(withdrawalRequest.flow);

  const session = await getLightsatsServerSession(req, res);

  const userId =
    withdrawalRequest.flow === "anonymous" ? undefined : session?.user.id;

  const withdrawalMethod = isWebln === "true" ? "webln" : "invoice";

  try {
    await payWithdrawalInvoice(
      withdrawalRequest.flow,
      withdrawalRequest.invoice,
      userId,
      withdrawalRequest.tipId,
      withdrawalMethod,
      undefined
    );
    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    const errorMessage =
      "Failed to pay manual invoice " +
      withdrawalRequest.invoice +
      (withdrawalRequest.flow === "anonymous"
        ? " tipId " + withdrawalRequest.tipId
        : " userId " + userId) +
      ": " +
      JSON.stringify(error, Object.getOwnPropertyNames(error));

    console.error(errorMessage, error);

    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        tipId: withdrawalRequest.tipId,
        withdrawalFlow: withdrawalRequest.flow,
        withdrawalMethod,
        withdrawalInvoice: withdrawalRequest.invoice,
      },
    });

    return res.status(500).json((error as Error).message);
  }
}
