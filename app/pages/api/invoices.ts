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
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }

  switch (req.method) {
    case "POST":
      return handlePayInvoice(session, req, res);
    default:
      return res.status(StatusCodes.NOT_FOUND).end();
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
    return res.status(204).end();
  } catch (error) {
    console.error(
      "Failed to pay manual invoice " +
        withdrawalRequest.invoice +
        " userId " +
        session.user.id,
      error
    );
    return res.status(500).json((error as Error).message);
  }
}
