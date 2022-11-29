import * as bolt11 from "bolt11";

import { Tip } from "@prisma/client";
import prisma from "lib/prismadb";
import { recreateTipFundingInvoice } from "lib/recreateTipFundingInvoice";

export async function regenerateExpiredTipInvoice(tip: Tip): Promise<Tip> {
  if (tip.status !== "UNFUNDED" || !tip.invoice) {
    return tip;
  }

  const decodedInvoice = bolt11.decode(tip.invoice);

  if (
    decodedInvoice.timeExpireDateString &&
    Date.now() > new Date(decodedInvoice.timeExpireDateString).getTime()
  ) {
    const wallet = await prisma.lnbitsWallet.findUnique({
      where: {
        tipId: tip.id,
      },
    });
    if (wallet) {
      console.log("Regenerating expired tip invoice for " + tip.id);
      return recreateTipFundingInvoice(tip, wallet.adminKey);
    } else {
      console.error(
        "No wallet exists for tip " +
          tip.id +
          " - unable to generate new invoice"
      );
    }
  }

  return tip;
}
