import { WithdrawalFlow } from "@prisma/client";

export type WithdrawalRequest = {
  invoice: string;
  flow: WithdrawalFlow;
};
