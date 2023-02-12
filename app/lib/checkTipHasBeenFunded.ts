import { Tip } from "@prisma/client";
import { createAchievement } from "lib/createAchievement";
import { getPayment } from "lib/lnbits/getPayment";
import { markTipAsUnseen } from "lib/markTipAsUnseen";
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
    try {
      const invoiceStatus = await getPayment(wallet.adminKey, tip.invoiceId);
      if (invoiceStatus.paid) {
        tip = await markTipAsUnseen(tip);
        await createAchievement(tip.tipperId, "FUNDED_TIP");
        // console.log("Tip has been funded: ", tip.id);
      }
    } catch (error) {
      console.error("Failed to get tip invoice status", error);
    }
  }
  return tip;
}
