export type TipRequestBase = {
  currency: string;
  expiry: Date;
  skipOnboarding: boolean;
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
  tippeeNames?: string[]; // bulk tips only
  recommendedWalletId?: string;
};

export type CreateTipRequest = TipRequestBase & {
  amount: number;
  quantity: number;
};
export type UpdateTipRequest = TipRequestBase;

export type UpdateTipsRequest = TipRequestBase;
