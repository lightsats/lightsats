import { Prisma, WithdrawalFlow, WithdrawalMethod } from "@prisma/client";
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
  withdrawalMethod: WithdrawalMethod
) {
  const preliminaryLastWithdrawalResult = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastWithdrawal: true },
  });

  // first do a preliminary check outside of a transaction to see if the user last withdrew less than a minute ago
  if (
    preliminaryLastWithdrawalResult.lastWithdrawal &&
    Date.now() -
      new Date(preliminaryLastWithdrawalResult.lastWithdrawal).getTime() <
      60000 /* allow withdrawals once per minute */
  ) {
    const errorMessage =
      "Your last withdrawal attempt was less than a minute ago. Please wait before trying again.";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });
    throw new Error(errorMessage);
  }

  // update last withdrawal in a transaction to force withdrawals to be more than one minute apart.
  // This check will reset the last withdrawal time even if it was less than 60 seconds ago
  // (the preliminary check above is just to make the process more user friendly)
  const [lastWithdrawalResult] = await prisma.$transaction(
    [
      prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { lastWithdrawal: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { lastWithdrawal: new Date() },
      }),
    ],
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  if (
    lastWithdrawalResult.lastWithdrawal &&
    Date.now() - new Date(lastWithdrawalResult.lastWithdrawal).getTime() <
      60000 /* allow withdrawals once per minute */
  ) {
    const errorMessage =
      "Your last withdrawal attempt was less than a minute ago. Please wait a full minute before trying again. (Transaction)";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });
    throw new Error(errorMessage);
  }

  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }

  const withdrawalInvoicePriceInSats =
    parseInt(bolt11.decode(invoice).millisatoshis || "0") / 1000;

  // FIXME: this needs to be in a transaction / only use the ids of tips originally retrieved, not the same query
  const tips = await prisma.tip.findMany({
    where: getWithdrawableTipsQuery(userId, withdrawalFlow),
    include: {
      tipper: true,
    },
  });

  if (!tips.length) {
    const errorMessage = "No tips are available to withdraw";
    // no tips to claim
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId: userId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });

    throw new Error(errorMessage);
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);

  if (withdrawalInvoicePriceInSats !== amount) {
    const errorMessage = "Withdrawal request does not match user balance";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId: userId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });

    throw new Error(errorMessage);
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

    const errorMessage =
      "Failed to withdraw funds for user " +
      userId +
      ": " +
      withdrawalError.message;

    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId: userId,
        withdrawalMethod,
        withdrawalFlow,
        withdrawalInvoice: invoice,
      },
    });

    throw new Error(errorMessage);
  } else {
    const payment = await getPayment(
      userWallet.adminKey,
      payInvoiceResponseBody.checking_id
    );
    if (!payment.paid) {
      const errorMessage =
        "Outgoing payment was not paid: " + payInvoiceResponseBody.checking_id;

      await prisma.withdrawalError.create({
        data: {
          message: errorMessage,
          userId: userId,
          withdrawalFlow,
          withdrawalMethod,
          withdrawalInvoice: invoice,
        },
      });

      throw new Error(errorMessage);
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
      withdrawalMethod === "lnurlw"
    );
  }
}
