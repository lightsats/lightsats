import { getPayment } from "lib/lnbits/getPayment";
import prisma from "lib/prismadb";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export async function checkTipGroupHasBeenFunded(
  tipGroup: TipGroupWithTips
): Promise<TipGroupWithTips> {
  if (tipGroup.status !== "UNFUNDED") {
    return tipGroup;
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
        tipGroup = await prisma.tipGroup.update({
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
        //await createAchievement(tipGroup.tipperId, "FUNDED_TIP_GROUP");
        // console.log("Tip group has been funded: ", tip.id);
      }
    } catch (error) {
      console.error("Failed to get tip invoice status", error);
    }
  }
  return tipGroup;
}
