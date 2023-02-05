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

  // const { key } = req.query;
  // if (key !== process.env.LNBITS_WEBHOOK_SECRET_KEY) {
  //   console.log("Received invoice - key mismatch");
  //   return res.status(StatusCodes.UNAUTHORIZED).end();
  // }
  // console.warn("INVOICE WEBHOOK IS DISABLED");

  /*const invoice: PaidInvoice = req.body as PaidInvoice;
  console.log("Received invoice", invoice);
  await prisma.tip.updateMany({
    data: {
      status: "UNCLAIMED",
    },
    where: {
      invoiceId: {
        equals: invoice.checking_id,
      },
    },
  });*/
  return res.status(StatusCodes.GONE).end();
  //res.status(StatusCodes.OK).end();
}
