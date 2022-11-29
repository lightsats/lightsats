import { Tip } from "@prisma/client";
import { createFundingInvoice } from "lib/lnbits/createInvoice";
import prisma from "lib/prismadb";

export async function recreateTipFundingInvoice(
  tip: Tip,
  tipWalletAdminKey: string
): Promise<Tip> {
  // create the tip's funding invoice
  const fundingInvoice = await createFundingInvoice(
    tip.amount + tip.fee,
    tipWalletAdminKey
  );

  return prisma.tip.update({
    where: {
      id: tip.id,
    },
    data: {
      invoice: fundingInvoice.invoice,
      invoiceId: fundingInvoice.invoiceId,
    },
  });
}
