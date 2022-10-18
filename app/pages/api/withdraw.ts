import { Prisma } from "@prisma/client";
import * as bolt11 from "bolt11";
import { StatusCodes } from "http-status-codes";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { WithdrawalRequest } from "types/WithdrawalRequest";

type PayInvoiceRequest = {
  out: true;
  bolt11: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handleWithdrawal(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}

async function handleWithdrawal(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  // TODO: confirm this with a lightning expert
  const withdrawalRequest = req.body as WithdrawalRequest;
  if (
    withdrawalRequest.flow !== "tippee" &&
    withdrawalRequest.flow !== "tipper"
  ) {
    throw new Error("Unsupporter withdrawal flow: " + withdrawalRequest.flow);
  }

  const withdrawalInvoicePriceInSats =
    parseInt(bolt11.decode(withdrawalRequest.invoice).millisatoshis || "0") /
    1000;

  // FIXME: this needs to execute in a transaction to avoid double withdrawals
  const whereQuery: Prisma.TipWhereInput =
    withdrawalRequest.flow === "tippee"
      ? {
          tippeeId: {
            equals: session.user.id,
          },
          status: {
            equals: "CLAIMED",
          },
        }
      : {
          tipperId: {
            equals: session.user.id,
          },
          status: {
            equals: "RECLAIMED",
          },
        };
  const tips = await prisma.tip.findMany({
    where: whereQuery,
  });

  if (!tips.length) {
    // no tips to claim
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);

  if (withdrawalInvoicePriceInSats !== amount) {
    res.status(StatusCodes.CONFLICT).end();
    return;
  }

  // FIXME: the sats aren't actually "withdrawn" yet, just than an invoice will be generated for them.
  await prisma.tip.updateMany({
    where: whereQuery,
    data: {
      status: "WITHDRAWING",
    },
  });

  // curl -X POST https://legend.lnbits.com/api/v1/payments -d '{"out": true, "bolt11": <string>}' -H "X-Api-Key: 76c2153437ea421b8f2a0067e786d340" -H "Content-type: application/json"

  const payInvoiceRequest: PayInvoiceRequest = {
    out: true,
    bolt11: withdrawalRequest.invoice,
  };

  const payInvoiceRequestHeaders = new Headers();
  payInvoiceRequestHeaders.append("Content-Type", "application/json");
  payInvoiceRequestHeaders.append("Accept", "application/json");
  payInvoiceRequestHeaders.append("X-Api-Key", process.env.LNBITS_API_KEY);

  const payInvoiceResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments`,
    {
      method: "POST",
      body: JSON.stringify(payInvoiceRequest),
      headers: payInvoiceRequestHeaders,
    }
  );

  // console.log("Payment invoice response", payInvoiceResponse);

  // tips were updated - update the status to retrieve the same tips
  whereQuery.status = {
    equals: "WITHDRAWING",
  };

  if (!payInvoiceResponse.ok) {
    await prisma.tip.updateMany({
      where: whereQuery,
      data: {
        status: "WITHDRAWAL_FAILED",
      },
    });

    throw new Error("Invoice payment failed: " + payInvoiceResponse.statusText);
  }

  await prisma.tip.updateMany({
    where: whereQuery,
    data: {
      status: withdrawalRequest.flow === "tippee" ? "WITHDRAWN" : "REFUNDED",
    },
  });

  res.status(204).end();
}
