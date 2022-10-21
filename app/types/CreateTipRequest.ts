export type CreateTipRequest = {
  amount: number;
  currency: string;
  expiry: Date;
  tippeeName?: string;
  note?: string;
};
