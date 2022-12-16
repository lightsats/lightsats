import { WithdrawalFlow } from "@prisma/client";

export type LnurlWithdrawalRequest = {
  flow: WithdrawalFlow;
  amount: number;
  tipId?: string;
};
