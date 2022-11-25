export type TipRequestBase = { currency: string };

export type CreateTipRequest = TipRequestBase & { amount: number };
export type UpdateTipRequest = TipRequestBase & {
  expiry: Date;
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
};
