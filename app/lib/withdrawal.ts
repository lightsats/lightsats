import { Prisma, WithdrawalFlow } from "@prisma/client";

export function checkWithdrawalFlow(flow: WithdrawalFlow) {
  if (flow !== "tippee" && flow !== "tipper" && flow !== "anonymous") {
    throw new Error("Unsupported withdrawal flow: " + flow);
  }
}

export function getWithdrawalInitialTipStatus(flow: WithdrawalFlow) {
  return flow === "tippee"
    ? "CLAIMED"
    : flow === "tipper"
    ? "RECLAIMED"
    : "UNCLAIMED";
}

export function getWithdrawableTipsQuery(
  flow: WithdrawalFlow,
  userId: string | undefined,
  tipId: string | undefined
) {
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
      : flow === "tipper"
      ? {
          tipperId: {
            equals: userId,
          },
        }
      : {
          onboardingFlow: "SKIP",
          id: {
            equals: tipId,
          },
        }),
  };
  return whereQuery;
}
