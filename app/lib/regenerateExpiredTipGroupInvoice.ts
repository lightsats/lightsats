import * as bolt11 from "bolt11";

import prisma from "lib/prismadb";
import { recreateTipGroupFundingInvoice } from "lib/recreateTipGroupFundingInvoice";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export async function regenerateExpiredTipGroupInvoice(
  tipGroup: TipGroupWithTips
): Promise<void> {
  if (tipGroup.status !== "UNFUNDED" || !tipGroup.invoice) {
    return;
  }

  const decodedInvoice = bolt11.decode(tipGroup.invoice);

  if (
    decodedInvoice.timeExpireDateString &&
    Date.now() > new Date(decodedInvoice.timeExpireDateString).getTime()
  ) {
    const wallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipGroupId: tipGroup.id,
      },
    });
    if (wallet) {
      console.log("Regenerating expired tip invoice for " + tipGroup.id);
      await recreateTipGroupFundingInvoice(tipGroup, wallet.adminKey);
    } else {
      console.error(
        "No wallet exists for tip group " +
          tipGroup.id +
          " - unable to generate new invoice"
      );
    }
  }
}
