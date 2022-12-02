import { Tip } from "@prisma/client";
import { TIP_NUM_SMS_TOKENS } from "lib/constants";
import { createAchievement } from "lib/createAchievement";
import { getPayment } from "lib/lnbits/getPayment";
import prisma from "lib/prismadb";

export async function checkTipHasBeenFunded(tip: Tip) {
  if (tip.status !== "UNFUNDED") {
    return tip;
  }
  const wallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipId: tip.id,
    },
  });
  if (wallet && tip.invoiceId) {
    const invoiceStatus = await getPayment(wallet.adminKey, tip.invoiceId);
    if (invoiceStatus.paid) {
      tip = await prisma.tip.update({
        data: {
          status: "UNCLAIMED",
          numSmsTokens: TIP_NUM_SMS_TOKENS,
        },
        where: {
          id: tip.id,
        },
      });
      await createAchievement(tip.tipperId, "FUNDED_TIP");
      // console.log("Tip has been funded: ", tip.id);
    }
  }
  return tip;
}
