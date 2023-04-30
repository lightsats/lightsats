import { Withdrawal } from "@prisma/client";
import { PublicTip } from "types/PublicTip";

export type WithdrawalWithPublicTips = Withdrawal & { tips: PublicTip[] };
