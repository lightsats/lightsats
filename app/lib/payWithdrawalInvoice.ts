import { Prisma, WithdrawalFlow, WithdrawalMethod } from "@prisma/client";
import * as bolt11 from "bolt11";
import { completeWithdrawal } from "lib/completeWithdrawal";
import { WITHDRAWAL_RETRY_DELAY } from "lib/constants";
import { getPayment } from "lib/lnbits/getPayment";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import { getWithdrawableTipsQuery } from "lib/withdrawal";

export async function payWithdrawalInvoice(
  withdrawalFlow: WithdrawalFlow,
  invoice: string,
  userId: string | undefined,
  tipId: string | undefined,
  withdrawalMethod: WithdrawalMethod,
  withdrawalLinkId: string | undefined
) {
  if (!userId && !tipId) {
    throw new Error("Either userId or tipId must be provided");
  }
  if (userId && tipId) {
    throw new Error("Only userId or tipId must be provided");
  }

  const lastWithdrawalQuery = {
    where: { id: tipId ?? userId },
    select: { lastWithdrawal: true },
  };

  const preliminaryLastWithdrawalResult = await (userId
    ? prisma.user.findUniqueOrThrow(lastWithdrawalQuery)
    : prisma.tip.findUniqueOrThrow(lastWithdrawalQuery));

  // first do a preliminary check outside of a transaction to see if the user last withdrew less than a minute ago
  if (
    preliminaryLastWithdrawalResult.lastWithdrawal &&
    Date.now() -
      new Date(preliminaryLastWithdrawalResult.lastWithdrawal).getTime() <
      WITHDRAWAL_RETRY_DELAY /* only allow withdrawals once per X seconds */
  ) {
    const errorMessage =
      "Your last withdrawal attempt was less than a minute ago. Please wait before trying again.";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        tipId,
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

  const updateLastWithdrawalQuery = {
    where: { id: userId ?? tipId },
    data: { lastWithdrawal: new Date() },
  };
  const updateWithdrawalTransactionSettings: Parameters<
    typeof prisma.$transaction
  >[1] = {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  };
  const [lastWithdrawalResult] = await (userId
    ? prisma.$transaction(
        [
          prisma.user.findUniqueOrThrow(lastWithdrawalQuery),
          prisma.user.update(updateLastWithdrawalQuery),
        ],
        updateWithdrawalTransactionSettings
      )
    : prisma.$transaction(
        [
          prisma.tip.findUniqueOrThrow(lastWithdrawalQuery),
          prisma.tip.update(updateLastWithdrawalQuery),
        ],
        updateWithdrawalTransactionSettings
      ));

  if (
    lastWithdrawalResult.lastWithdrawal &&
    Date.now() - new Date(lastWithdrawalResult.lastWithdrawal).getTime() <
      WITHDRAWAL_RETRY_DELAY /* only allow withdrawals once per X seconds */
  ) {
    const errorMessage =
      "Your last withdrawal attempt was less than a minute ago. Please wait a full minute before trying again. (Transaction)";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        tipId,
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
    where: getWithdrawableTipsQuery(withdrawalFlow, userId, tipId),
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
        userId,
        tipId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });

    throw new Error(errorMessage);
  }

  const amount = tips.map((tip) => tip.amount).reduce((a, b) => a + b);

  if (withdrawalInvoicePriceInSats !== amount) {
    const errorMessage = "Withdrawal request does not match user/tip balance";
    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        tipId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice: invoice,
      },
    });

    throw new Error(errorMessage);
  }

  const lnbitsWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      userId: userId,
      tipId: tipId,
    },
  });
  if (!lnbitsWallet) {
    throw new Error(
      "User " + userId + " Tip " + tipId + " has no staging wallet"
    );
  }

  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    invoice,
    lnbitsWallet.adminKey
  );

  if (!payInvoiceResponse.ok || !payInvoiceResponseBody) {
    const errorMessage =
      "Failed to pay withdrawal invoice for " +
      (userId ? `user " + ${userId}` : `tip ${tipId}`) +
      ": " +
      payInvoiceResponse.status +
      " " +
      payInvoiceResponse.statusText +
      " " +
      (JSON.stringify(payInvoiceResponseBody) ?? "Unknown error");

    await prisma.withdrawalError.create({
      data: {
        message: errorMessage,
        userId,
        tipId,
        withdrawalFlow,
        withdrawalInvoice: invoice,
        withdrawalMethod,
      },
    });

    throw new Error(errorMessage);
  } else {
    const payment = await getPayment(
      lnbitsWallet.adminKey,
      payInvoiceResponseBody.checking_id
    );
    if (!payment.paid) {
      const errorMessage =
        "Outgoing payment was not paid: " + payInvoiceResponseBody.checking_id;

      await prisma.withdrawalError.create({
        data: {
          message: errorMessage,
          userId,
          tipId,
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
      tipId,
      withdrawalFlow,
      lnbitsWallet,
      payment.details.fee,
      payment.details.checking_id,
      payment.details.bolt11,
      withdrawalMethod,
      tips,
      withdrawalMethod === "lnurlw",
      withdrawalLinkId
    );
  }
}
