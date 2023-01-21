export const ExpiryUnitValues = ["minutes", "hours", "days"] as const;
export type ExpiryUnit = typeof ExpiryUnitValues[number];

export type TipFormData = {
  amount: number;
  quantity: number;
  amountString: string;
  currency: string;
  note: string | undefined;
  expiresIn: number;
  expiryUnit: ExpiryUnit;
  tippeeName: string | undefined;
  tippeeLocale: string;
  skipOnboarding: boolean;
  enterIndividualNames: boolean;
  showAdvancedOptions: boolean;
  suggestedWalletId: string | undefined;
};
