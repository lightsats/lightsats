import { Tip, WithdrawalMethod } from "@prisma/client";
import prisma from "lib/prismadb";

export async function addWithdrawalInvoiceToTips(
  tips: Tip[],
  invoiceId: string | null,
  invoice: string,
  status: number,
  statusText: string,
  errorBody: string | null,
  withdrawalMethod: WithdrawalMethod
) {
  await prisma.tip.updateMany({
    where: {
      id: {
        in: tips.map((tip) => tip.id),
      },
    },
    data: {
      withdrawalInvoiceId: invoiceId,
      withdrawalInvoice: invoice,
      payInvoiceStatus: status,
      payInvoiceStatusText: statusText,
      payInvoiceErrorBody: errorBody,
      withdrawalMethod,
    },
  });
}
