import { Tip, User } from "@prisma/client";
import { pendingWithdrawalTipStatuses } from "lib/constants";

export function calculateUserWalletBalance(
  userWithTipsReceived: User & { tipsReceived: Tip[] }
) {
  return userWithTipsReceived.tipsReceived
    .filter(
      (tip) =>
        tip.type !== "NON_CUSTODIAL_NWC" &&
        pendingWithdrawalTipStatuses.indexOf(tip.status) > -1
    )
    .map((tip) => tip.amount + tip.fee)
    .reduce((a, b) => a + b, 0);
}
