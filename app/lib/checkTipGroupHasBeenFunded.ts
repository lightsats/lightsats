import { createAchievement } from "lib/createAchievement";
import { getPayment } from "lib/lnbits/getPayment";
import prisma from "lib/prismadb";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export async function checkTipGroupHasBeenFunded(
  tipGroup: TipGroupWithTips
): Promise<void> {
  if (tipGroup.status !== "UNFUNDED") {
    return;
  }
  const wallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipGroupId: tipGroup.id,
    },
  });
  if (wallet && tipGroup.invoiceId) {
    try {
      const invoiceStatus = await getPayment(
        wallet.adminKey,
        tipGroup.invoiceId
      );
      if (invoiceStatus.paid) {
        await prisma.tipGroup.update({
          data: {
            status: "FUNDED",
          },
          where: {
            id: tipGroup.id,
          },
          include: {
            tips: true,
          },
        });
        await createAchievement(tipGroup.tipperId, "BULK_TIP_FUNDED");
        for (const numTips of [10, 25, 50, 100] as const) {
          if (tipGroup.tips.length >= numTips) {
            await createAchievement(tipGroup.tipperId, `BULK_TIP_${numTips}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to get tip invoice status", error);
    }
  }
}
