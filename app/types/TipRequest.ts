import { OnboardingFlow, TipType } from "@prisma/client";

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
  generatePassphrase: boolean;
  passphraseLength: number;
  claimWebhookUrl?: string;
  withdrawWebhookUrl?: string;
  advertisementUrl?: string;
  advertisementImageUrl?: string;
};

export type CreateTipRequest = TipRequestBase & {
  amount: number;
  quantity: number;
  type?: TipType;
  enableStaticLink?: boolean;
};
export type UpdateTipRequest = TipRequestBase;

export type UpdateTipsRequest = TipRequestBase & {
  enableStaticLink?: boolean;
};
