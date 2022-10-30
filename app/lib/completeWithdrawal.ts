import { LnbitsWallet, Tip } from "@prisma/client";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";

export async function completeWithdrawal(
  userWallet: LnbitsWallet,
  negativeOutboundFeeMsats: number,
  withdrawalInvoiceId: string,
  tips: Tip[]
) {
  if (!process.env.LNBITS_API_KEY) {
    throw new Error("No LNBITS_API_KEY provided");
  }
  if (negativeOutboundFeeMsats > 0) {
    throw new Error("Routing fee should always be negative ()");
  }
  if (!userWallet.userId) {
    throw new Error("User wallet has no user ID: " + userWallet.id);
  }
  const paidRoutingFeeSats = Math.ceil(
    Math.abs(negativeOutboundFeeMsats) / 1000
  );
  if (!tips.length) {
    throw new Error("Cannot complete withdrawal without any tips");
  }
  const withdrawalFlow = tips[0].withdrawalFlow;
  if (tips.some((tip) => tip.withdrawalFlow !== withdrawalFlow)) {
    throw new Error(
      "Inconsistent withdrawal flow when withdrawing tips. ids: " +
        tips.map((tip) => tip.id).join(", ")
    );
  }
  await prisma.tip.updateMany({
    where: {
      id: {
        in: tips.map((tip) => tip.id),
      },
    },
    data: {
      status: withdrawalFlow === "tippee" ? "WITHDRAWN" : "REFUNDED",
    },
  });

  await prisma.withdrawal.create({
    data: {
      routingFee: paidRoutingFeeSats,
      userId: userWallet.userId,
      withdrawalInvoiceId,
      tips: {
        connect: tips.map((tip) => ({ id: tip.id })),
      },
    },
  });

  try {
    const tipFees = tips.map((tip) => tip.fee).reduce((a, b) => a + b);
    const remainingBalance = tipFees - paidRoutingFeeSats;
    console.log(
      `Withdrawing tips ${tips
        .map((tip) => tip.id)
        .join(
          ", "
        )} collected ${remainingBalance}/${tipFees} fees (routing fee of ${paidRoutingFeeSats})`
    );

    if (remainingBalance > 0) {
      // move remainingBalance to margin wallet
      const { invoice } = await createInvoice(
        remainingBalance,
        process.env.LNBITS_API_KEY,
        "withdraw unspent fees",
        undefined
      );
      const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
        invoice,
        userWallet.adminKey
      );
      if (!payInvoiceResponse.ok) {
        throw new Error(
          "Failed to pay invoice: " +
            payInvoiceResponse.status +
            " " +
            payInvoiceResponse.statusText +
            " " +
            JSON.stringify(payInvoiceResponseBody)
        );
      }
    }
  } catch (error) {
    console.error(
      "Failed to withdraw remaining balance from user " +
        userWallet.userId +
        " staging wallet.",
      "Tip ids",
      tips.map((tip) => tip.id).join(", "),
      error
    );
  }
}
