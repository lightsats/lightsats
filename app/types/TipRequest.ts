export type TipRequestBase = { currency: string; expiry: Date };

export type CreateTipRequest = TipRequestBase & { amount: number };
export type UpdateTipRequest = TipRequestBase & {
  tippeeName?: string;
  tippeeLocale: string;
  note?: string;
};
