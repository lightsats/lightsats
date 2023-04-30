import { WithdrawalMethod } from "@prisma/client";

export type MarkNonCustodialTipWithdrawnRequest = {
  invoice: string;
  withdrawalMethod: WithdrawalMethod;
};
