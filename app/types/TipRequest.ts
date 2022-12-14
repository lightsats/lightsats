export type TipRequestBase = {
  currency: string;
  expiry: Date;
  skipOnboarding: boolean;
};

export type CreateTipRequest = TipRequestBase & { amount: number };
export type UpdateTipRequest = TipRequestBase & {
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
};
