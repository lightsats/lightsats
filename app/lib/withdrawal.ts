import { Prisma, WithdrawalFlow } from "@prisma/client";

export function checkWithdrawalFlow(flow: WithdrawalFlow) {
  if (flow !== "tippee" && flow !== "tipper") {
    throw new Error("Unsupported withdrawal flow: " + flow);
  }
}

export function getWithdrawalInitialTipStatus(flow: WithdrawalFlow) {
  return flow === "tippee" ? "CLAIMED" : "RECLAIMED";
}

export function getWithdrawableTipsQuery(userId: string, flow: WithdrawalFlow) {
  const initialStatus = getWithdrawalInitialTipStatus(flow);
  // TODO: consider running the below code in a transaction
  const whereQuery: Prisma.TipWhereInput = {
    status: {
      equals: initialStatus,
    },
    ...(flow === "tippee"
      ? {
          tippeeId: {
            equals: userId,
          },
          expiry: {
            gt: new Date(), // cannot withdraw expired tips
          },
        }
      : {
          tipperId: {
            equals: userId,
          },
        }),
  };
  return whereQuery;
}
