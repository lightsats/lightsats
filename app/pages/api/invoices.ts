import * as bolt11 from "bolt11";
import { StatusCodes } from "http-status-codes";
import { completeWithdrawal } from "lib/completeWithdrawal";
import { getPayment } from "lib/lnbits/getPayment";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import { checkWithdrawalFlow, getWithdrawableTipsQuery } from "lib/withdrawal";
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
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  const withdrawalRequest = req.body as InvoiceWithdrawalRequest;
  checkWithdrawalFlow(withdrawalRequest.flow);

  const withdrawalInvoicePriceInSats =
    parseInt(bolt11.decode(withdrawalRequest.invoice).millisatoshis || "0") /
    1000;

  // FIXME: this needs to be in a transaction / only use the ids of tips originally retrieved, not the same query
  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(session.user.id, withdrawalRequest.flow),
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

  const userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  if (!userWallet) {
    throw new Error("User " + session.user.id + " has no staging wallet");
  }

  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    withdrawalRequest.invoice,
    userWallet.adminKey
  );

  if (!payInvoiceResponse.ok || !payInvoiceResponseBody) {
    await prisma.withdrawalError.create({
      data: {
        message:
          payInvoiceResponse.status +
          " " +
          payInvoiceResponse.statusText +
          " " +
          (JSON.stringify(payInvoiceResponseBody) ?? "Unknown error"),
        userId: session.user.id,
      },
    });

    // revert to initial status so the user can retry
    console.error(
      "Failed to withdraw funds for user " +
        session.user.id +
        ": " +
        payInvoiceResponse.status,
      payInvoiceResponseBody
    );

    res.status(StatusCodes.BAD_GATEWAY).json({
      status: payInvoiceResponse.status,
      statusText: payInvoiceResponse.statusText,
      body: payInvoiceResponseBody,
    });
  } else {
    const payment = await getPayment(
      userWallet.adminKey,
      payInvoiceResponseBody.checking_id
    );
    if (!payment.paid) {
      throw new Error("Outgoing payment is not paid: ");
    }
    await completeWithdrawal(
      session.user.id,
      userWallet,
      payment.details.fee,
      payment.details.checking_id,
      payment.details.bolt11,
      "invoice",
      tips
    );
    res.status(204).end();
  }
}
