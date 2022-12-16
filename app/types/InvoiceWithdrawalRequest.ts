import { WithdrawalFlow } from "@prisma/client";

export type InvoiceWithdrawalRequest = {
  invoice: string;
  flow: WithdrawalFlow;
  tipId: string | undefined;
};
