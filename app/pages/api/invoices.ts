import { StatusCodes } from "http-status-codes";
import { payWithdrawalInvoice } from "lib/payWithdrawalInvoice";

import { checkWithdrawalFlow } from "lib/withdrawal";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
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

  const session = await unstable_getServerSession(req, res, authOptions);

  const userId =
    withdrawalRequest.flow === "anonymous" ? undefined : session?.user.id;

  try {
    await payWithdrawalInvoice(
      withdrawalRequest.flow,
      withdrawalRequest.invoice,
      userId,
      withdrawalRequest.tipId,
      isWebln === "true" ? "webln" : "invoice",
      undefined
    );
    return res.status(StatusCodes.NO_CONTENT).end();
  } catch (error) {
    console.error(
      "Failed to pay manual invoice " +
        withdrawalRequest.invoice +
        (withdrawalRequest.flow === "anonymous"
          ? " tipId " + withdrawalRequest.tipId
          : " userId " + userId) +
        error
    );
    return res.status(500).json((error as Error).message);
  }
}
