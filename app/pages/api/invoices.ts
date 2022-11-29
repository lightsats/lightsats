import { StatusCodes } from "http-status-codes";
import { payWithdrawalInvoice } from "lib/payWithdrawalInvoice";

import { checkWithdrawalFlow } from "lib/withdrawal";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { InvoiceWithdrawalRequest } from "types/InvoiceWithdrawalRequest";

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
      return handlePayInvoice(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handlePayInvoice(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isWebln } = req.query;
  const withdrawalRequest = req.body as InvoiceWithdrawalRequest;
  checkWithdrawalFlow(withdrawalRequest.flow);

  try {
    await payWithdrawalInvoice(
      withdrawalRequest.flow,
      withdrawalRequest.invoice,
      session.user.id,
      isWebln === "true" ? "webln" : "invoice"
    );
    res.status(204).end();
  } catch (error) {
    console.error(
      "Failed to pay manual invoice " +
        withdrawalRequest.invoice +
        " userId " +
        session.user.id,
      error
    );
    res.status(500).json((error as Error).message);
  }
}
