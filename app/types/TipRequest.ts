import { OnboardingFlow } from "@prisma/client";

export type TipRequestBase = {
  currency: string;
  expiry: Date;
  onboardingFlow: OnboardingFlow;
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
  tippeeNames?: string[]; // bulk tips only
  recommendedWalletId?: string;
  anonymousTipper: boolean;
};

export type CreateTipRequest = TipRequestBase & {
  amount: number;
  quantity: number;
  generatePassphrase: boolean;
  passphraseLength: number;
};
export type UpdateTipRequest = TipRequestBase;

export type UpdateTipsRequest = TipRequestBase;
