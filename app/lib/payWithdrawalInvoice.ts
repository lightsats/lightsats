import { WithdrawalFlow, WithdrawalMethod } from "@prisma/client";
import * as bolt11 from "bolt11";
import { completeWithdrawal } from "lib/completeWithdrawal";
import { getPayment } from "lib/lnbits/getPayment";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import { getWithdrawableTipsQuery } from "lib/withdrawal";

export async function payWithdrawalInvoice(
  withdrawalFlow: WithdrawalFlow,
  invoice: string,
  userId: string,
  withdrawalMethod: WithdrawalMethod,
  withdrawalLinkId: string | undefined
) {
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  const withdrawalInvoicePriceInSats =
    parseInt(bolt11.decode(invoice).millisatoshis || "0") / 1000;

  // FIXME: this needs to be in a transaction / only use the ids of tips originally retrieved, not the same query
  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(userId, withdrawalFlow),
  });

  if (!tips.length) {
    // no tips to claim
    throw new Error("No tips");
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);

  if (withdrawalInvoicePriceInSats !== amount) {
    throw new Error("Withdrawal request does not match user balance");
  }

  const userWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: userId,
    },
  });
  if (!userWallet) {
    throw new Error("User " + userId + " has no staging wallet");
  }

  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    invoice,
    userWallet.adminKey
  );

  if (!payInvoiceResponse.ok || !payInvoiceResponseBody) {
    const withdrawalError = await prisma.withdrawalError.create({
      data: {
        message:
          payInvoiceResponse.status +
          " " +
          payInvoiceResponse.statusText +
          " " +
          (JSON.stringify(payInvoiceResponseBody) ?? "Unknown error"),
        userId: userId,
      },
    });

    throw new Error(
      "Failed to withdraw funds for user " +
        userId +
        ": " +
        withdrawalError.message
    );
  } else {
    const payment = await getPayment(
      userWallet.adminKey,
      payInvoiceResponseBody.checking_id
    );
    if (!payment.paid) {
      throw new Error(
        "Outgoing payment was not paid: " + payInvoiceResponseBody.checking_id
      );
    }
    console.log(
      "Payment was completed: " +
        payInvoiceResponseBody.checking_id +
        " fee: " +
        payment.details.fee
    );
    await completeWithdrawal(
      userId,
      userWallet,
      payment.details.fee,
      payment.details.checking_id,
      payment.details.bolt11,
      withdrawalMethod,
      tips,
      withdrawalLinkId
    );
  }
}
