import {
  LnbitsWallet,
  Tip,
  User,
  WithdrawalFlow,
  WithdrawalMethod,
} from "@prisma/client";
import { createAchievement } from "lib/createAchievement";
import { createNotification } from "lib/createNotification";
import { deleteUnusedWithdrawalLinks } from "lib/deleteStaleWithdrawalLinks";
import { sendEmail } from "lib/email/sendEmail";
import { createInvoice } from "lib/lnbits/createInvoice";
import { payInvoice } from "lib/lnbits/payInvoice";
import prisma from "lib/prismadb";
import { getTipUrl, getWithdrawWebhookContent } from "lib/utils";

export async function completeWithdrawal(
  userId: string | undefined,
  tipId: string | undefined,
  withdrawalFlow: WithdrawalFlow,
  lnbitsWallet: LnbitsWallet | undefined,
  possiblyNegativeOutboundFeeMsats: number,
  withdrawalInvoiceId: string | undefined,
  withdrawalInvoice: string,
  withdrawalMethod: WithdrawalMethod,
  tips: (Tip & {
    tipper: User;
  })[],
  deleteUsedWithdrawalLinks: boolean,
  withdrawalLinkId: string | undefined
) {
  if (withdrawalLinkId) {
    await prisma.withdrawalLink.update({
      where: {
        id: withdrawalLinkId,
      },
      data: {
        used: true,
      },
    });
  }

  if (deleteUsedWithdrawalLinks) {
    try {
      await deleteUnusedWithdrawalLinks(userId, tipId, false);
    } catch (error) {
      console.error("Failed to delete unused withdrawal links", error);
    }
  }

  const isCustodialWithdrawal = tips.some((tip) => tip.type === "CUSTODIAL");
  const paidRoutingFeeSats = Math.ceil(
    Math.abs(possiblyNegativeOutboundFeeMsats) / 1000
  );

  if (isCustodialWithdrawal) {
    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }
    if (!lnbitsWallet) {
      throw new Error("No lnbits wallet provided");
    }
    if (!withdrawalInvoiceId || !withdrawalInvoice) {
      throw new Error("No withdrawal invoice provided");
    }
    if (userId && !lnbitsWallet.userId) {
      throw new Error("User wallet has no user ID: " + lnbitsWallet.id);
    }
    if (tipId && !lnbitsWallet.tipId) {
      throw new Error("Tip wallet has no tip ID: " + lnbitsWallet.id);
    }

    if (!tips.length) {
      throw new Error("Cannot complete withdrawal without any tips");
    }
  }

  let withdrawalId: string | undefined;

  try {
    await prisma.tip.updateMany({
      where: {
        id: {
          in: tips.map((tip) => tip.id),
        },
      },
      data: {
        status:
          withdrawalFlow === "tippee" || withdrawalFlow === "anonymous"
            ? "WITHDRAWN"
            : "REFUNDED",
      },
    });

    const withdrawal = await prisma.withdrawal.create({
      data: {
        routingFee: paidRoutingFeeSats,
        userId,
        withdrawalInvoiceId,
        withdrawalInvoice,
        withdrawalFlow,
        withdrawalMethod,
        tips: {
          connect: tips.map((tip) => ({ id: tip.id })),
        },
      },
    });
    withdrawalId = withdrawal.id;
  } catch (error) {
    console.error("Failed to complete withdrawal", error);
    await prisma.withdrawalError.create({
      data: {
        message:
          "Failed to complete withdrawal " +
          JSON.stringify(error, Object.getOwnPropertyNames(error)),
        userId,
        tipId,
        withdrawalFlow,
        withdrawalMethod,
        withdrawalInvoice,
      },
    });

    // update of tip status failed, don't execute any further logic
    throw error;
  }

  if (isCustodialWithdrawal) {
    if (!process.env.LNBITS_API_KEY) {
      throw new Error("No LNBITS_API_KEY provided");
    }
    if (!lnbitsWallet) {
      throw new Error("No lnbitsWallet provided");
    }

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
          lnbitsWallet.adminKey
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
            "Failed to withdraw remaining balance from user/tip " +
            JSON.stringify(error, Object.getOwnPropertyNames(error)),
          userId,
          tipId,
          withdrawalFlow,
          withdrawalMethod,
        },
      });
    }
  }

  if (userId) {
    switch (withdrawalMethod) {
      case "invoice":
        await createAchievement(userId, "MANUAL_WITHDRAWN");
        break;
      case "lnurlw":
        await createAchievement(userId, "LNURL_WITHDRAWN");
        break;
      case "webln":
        await createAchievement(userId, "WEBLN_WITHDRAWN");
        break;
    }
  }

  if (withdrawalMethod === "lightning_address") {
    try {
      await createNotification(
        tips[0].tipperId,
        "AUTOMATIC_REFUND",
        undefined,
        undefined,
        withdrawalId
      );
    } catch (error) {
      console.error(
        "Failed to create automatic refund to lightning address notification",
        error
      );
    }
  }

  if (withdrawalFlow === "tippee" || withdrawalFlow === "anonymous") {
    for (const tip of tips) {
      if (tip.withdrawWebhookUrl) {
        try {
          const result = await fetch(tip.withdrawWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getWithdrawWebhookContent(tip.amount)),
          });
          if (!result.ok) {
            throw new Error(result.status + " " + (await result.text()));
          }
        } catch (error) {
          console.error(
            "Failed to post withdraw webhook for tip " + tip.id,
            error
          );
        }
      }

      await createNotification(tip.tipperId, "TIP_WITHDRAWN", tip.id);
      await createAchievement(tip.tipperId, "TIP_WITHDRAWN");
      if (withdrawalFlow === "anonymous") {
        await createAchievement(tip.tipperId, "TIPPED_A_BITCOINER");
      }
      if (tip.claimedFromPrintedCard) {
        await createAchievement(tip.tipperId, "PRINTED_CARD_TIP_WITHDRAWN");
      }
      if (tip.groupId) {
        await createAchievement(tip.tipperId, "BULK_TIP_WITHDRAWN");

        const firstUnwithdrawnTipInGroup = await prisma.tip.findFirst({
          where: {
            groupId: tip.groupId,
            status: {
              not: "WITHDRAWN",
            },
          },
        });
        if (!firstUnwithdrawnTipInGroup) {
          await createAchievement(tip.tipperId, "BULK_TIP_ALL_WITHDRAWN");
        }
      }

      try {
        if (tip.tipper.email) {
          await sendEmail({
            to: tip.tipper.email,
            subject: "Your recipient has withdrawn their sats!",
            html: `Good job! Your recipient is one step closer to being 🍊💊. See your tip: <a href="${getTipUrl(
              tip,
              tip.tipper.locale
            )}">click here</a>`,
            from: `Lightsats <${process.env.EMAIL_FROM}>`,
          });
        }
      } catch (error) {
        console.error(
          "Failed to send withdrawn notification email. Tip: " + tip.id
        );
      }
    }
  }
}
