import {
  LnbitsWallet,
  Tip,
  WithdrawalFlow,
  WithdrawalMethod,
} from "@prisma/client";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";

export async function completeWithdrawal(
  userId: string,
  userWallet: LnbitsWallet,
  negativeOutboundFeeMsats: number,
  withdrawalInvoiceId: string,
  withdrawalInvoice: string,
  withdrawalMethod: WithdrawalMethod,
  tips: Tip[]
) {
  const paidRoutingFeeSats = Math.ceil(
    Math.abs(negativeOutboundFeeMsats) / 1000
  );

  try {
    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }
    if (!userWallet.userId) {
      throw new Error("User wallet has no user ID: " + userWallet.id);
    }
    if (negativeOutboundFeeMsats > 0) {
      throw new Error("Routing fee should always be negative ()");
    }

    if (!tips.length) {
      throw new Error("Cannot complete withdrawal without any tips");
    }
    const withdrawalFlow: WithdrawalFlow =
      tips[0].status === "CLAIMED" ? "tippee" : "tipper";

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
        userId: userId,
        withdrawalInvoiceId,
        withdrawalInvoice,
        withdrawalFlow,
        withdrawalMethod,
        tips: {
          connect: tips.map((tip) => ({ id: tip.id })),
        },
      },
    });
  } catch (error) {
    console.error("Failed to compelte withdrawal", error);
    await prisma.withdrawalError.create({
      data: {
        message:
          "Failed to complete withdrawal " +
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        userId: userId,
      },
    });
  }

  try {
    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }
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
        userId +
        " staging wallet.",
      "Tip ids",
      tips.map((tip) => tip.id).join(", "),
      error
    );
    await prisma.withdrawalError.create({
      data: {
        message:
          "Failed to withdraw remaining balance from user " +
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        userId: userId,
      },
    });
  }
}
