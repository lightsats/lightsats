import { Prisma, TipStatus, WithdrawalFlow } from "@prisma/client";

export function checkWithdrawalFlow(flow: WithdrawalFlow) {
  if (flow !== "tippee" && flow !== "tipper" && flow !== "anonymous") {
    throw new Error("Unsupported withdrawal flow: " + flow);
  }
}

export function getWithdrawalInitialTipStatuses(
  flow: WithdrawalFlow
): TipStatus[] {
  return flow === "tippee"
    ? ["CLAIMED"]
    : flow === "tipper"
    ? ["RECLAIMED"]
    : ["UNSEEN", "SEEN"];
}

export function getWithdrawableTipsQuery(
  flow: WithdrawalFlow,
  userId: string | undefined,
  tipId: string | undefined
) {
  const initialStatuses = getWithdrawalInitialTipStatuses(flow);
  // TODO: consider running the below code in a transaction
  const whereQuery: Prisma.TipWhereInput = {
    status: {
      in: initialStatuses,
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
