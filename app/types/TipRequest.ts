export type TipRequestBase = {
  currency: string;
  expiry: Date;
  skipOnboarding: boolean;
};

export type CreateTipRequest = TipRequestBase & {
  amount: number;
  quantity: number;
};
export type UpdateTipRequest = TipRequestBase & {
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
};

export type UpdateTipsRequest = TipRequestBase & {
  tippeeLocale: string;
  tippeeNames?: string[];
  note?: string;
};
