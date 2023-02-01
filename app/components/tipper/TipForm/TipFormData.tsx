import { OnboardingFlow } from "@prisma/client";
import { add } from "date-fns";

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
  onboardingFlow: OnboardingFlow;
  enterIndividualNames: boolean;
  showAdvancedOptions: boolean;
  recommendedWalletId: string | undefined;
  anonymousTipper: boolean;
};

export type TipFormSubmitData = Omit<
  TipFormData,
  "enterIndividualNames" | "showAdvancedOptions"
> & {
  satsAmount: number;
};

export function getSharedTipFormRequestFields(data: TipFormSubmitData) {
  return {
    currency: data.currency,
    expiry: add(new Date(), {
      [data.expiryUnit]: data.expiresIn,
    }),
    onboardingFlow: data.onboardingFlow,
    tippeeLocale: data.tippeeLocale,
    note: data.note?.length ? data.note : undefined,
    recommendedWalletId: data.recommendedWalletId,
    anonymousTipper: data.anonymousTipper,
  };
}
