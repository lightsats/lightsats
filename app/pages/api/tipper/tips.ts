import { Tip } from "@prisma/client";
import { add } from "date-fns";
import { StatusCodes } from "http-status-codes";
import { appName } from "lib/constants";
import prisma from "lib/prismadb";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";
import { CreateTipRequest } from "types/CreateTipRequest";

type CreateInvoiceRequest = {
  out: false;
  amount: number;
  memo: string;
  webhook: string;
};

type CreateInvoiceResponse = {
  payment_hash: string;
  payment_request: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tip | Tip[]>
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    // TODO: add http status codes
    res.status(StatusCodes.UNAUTHORIZED).end();
    return;
  }

  switch (req.method) {
    case "POST":
      return handlePostTip(session, req, res);
    case "GET":
      return getTips(session, req, res);
    default:
      res.status(StatusCodes.NOT_FOUND).end();
      return;
  }
}
async function getTips(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip[]>
) {
  const tips = await prisma.tip.findMany({
    where: {
      tipperId: {
        equals: session.user.id,
      },
    },
    // TODO:
    orderBy: {
      created: "desc",
    },
  });

  res.status(StatusCodes.OK).json(tips);
}

async function handlePostTip(
  session: Session,
  req: NextApiRequest,
  res: NextApiResponse<Tip>
) {
  if (!process.env.APP_URL) {
    throw new Error("No APP_URL provided");
  }
  if (!process.env.LNBITS_URL) {
    throw new Error("No LNBITS_URL provided");
  }
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }
  if (!process.env.LNBITS_WEBHOOK_SECRET_KEY) {
    throw new Error("No LNBITS_WEBHOOK_SECRET_KEY provided");
  }

  // console.log(
  //   "create tip",
  //   "request body",
  //   req.body,
  //   "config:",
  //   process.env.APP_URL,
  //   process.env.LNBITS_URL
  // );
  const createTipRequest = req.body as CreateTipRequest;
  if (
    createTipRequest.amount <= 0 ||
    Math.floor(createTipRequest.amount) !== createTipRequest.amount
  ) {
    throw new Error("Only tips with positive, whole amounts are allowed");
  }

  // TODO: support creation of multiple tips (createTipRequest.numTips) but pay single invoice
  // when invoice is paid, update the status of all tips with that invoice
  const createInvoiceRequest: CreateInvoiceRequest = {
    out: false,
    amount: createTipRequest.amount,
    memo: `${appName} tip`,
    webhook: `${process.env.APP_URL}/api/webhooks/invoices?key=${process.env.LNBITS_WEBHOOK_SECRET_KEY}`,
  };

  const createInvoiceRequestHeaders = new Headers();
  createInvoiceRequestHeaders.append("Content-Type", "application/json");
  createInvoiceRequestHeaders.append("Accept", "application/json");
  createInvoiceRequestHeaders.append("X-Api-Key", process.env.LNBITS_API_KEY);

  const createInvoiceResponse = await fetch(
    `${process.env.LNBITS_URL}/api/v1/payments`,
    {
      method: "POST",
      body: JSON.stringify(createInvoiceRequest),
      headers: createInvoiceRequestHeaders,
    }
  );

  if (!createInvoiceResponse.ok) {
    throw new Error(
      "Unable to create invoice: " + createInvoiceResponse.statusText
    );
  }

  const createInvoiceResponseData =
    (await createInvoiceResponse.json()) as CreateInvoiceResponse;

  const expiry = add(new Date(), {
    months: 1,
  });
  const tip = await prisma.tip.create({
    data: {
      tipperId: session.user.id,
      amount: createTipRequest.amount,
      status: "UNFUNDED",
      invoice: createInvoiceResponseData.payment_request,
      invoiceId: createInvoiceResponseData.payment_hash,
      expiry,
      currency: createTipRequest.currency,
      note: createTipRequest.note,
    },
  });

  res.json(tip);
}
