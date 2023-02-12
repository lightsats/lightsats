import { StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

// many other properties come back from the lnbits webhook, but only the ones that are actually used are added here.
// type PaidInvoice = {
//   payment_hash: string;
//   checking_id: string;
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // handled in get /api/tipper/tips/[id].tsx
  // lnbits has no webhook retry mechanism, it is safer
  // for us to verify the payment ourselves.
  // for now this is done when the tipper requests the tip (polled on the tip page)

  return res.status(StatusCodes.GONE).end();
}
