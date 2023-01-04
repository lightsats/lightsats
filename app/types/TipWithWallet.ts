import { LnbitsWallet, Tip } from "@prisma/client";

export type TipWithWallet = Tip & {
  lnbitsWallet: LnbitsWallet | null;
};
