import { Tip } from "@prisma/client";

// TODO: add tipperName, expiry etc.
export type PublicTip = Pick<Tip, "amount" | "tipperId"> & {
  hasClaimed: boolean;
};
