import { createFundingInvoice } from "lib/lnbits/createInvoice";
import prisma from "lib/prismadb";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export async function recreateTipGroupFundingInvoice(
  tipGroup: TipGroupWithTips,
  tipWalletAdminKey: string
): Promise<TipGroupWithTips> {
  const fundingInvoice = await createFundingInvoice(
    (tipGroup.tips[0].amount + tipGroup.tips[0].fee) * tipGroup.quantity,
    tipWalletAdminKey
  );

  return prisma.tipGroup.update({
    where: {
      id: tipGroup.id,
    },
    data: {
      invoice: fundingInvoice.invoice,
      invoiceId: fundingInvoice.invoiceId,
    },
    include: {
      tips: true,
    },
  });
}
