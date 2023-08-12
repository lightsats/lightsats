import { OnboardingFlow, Tip, TipType } from "@prisma/client";
import { add, differenceInHours } from "date-fns";
import {
  DEFAULT_FIAT_CURRENCY,
  DEFAULT_TIP_PASSPHRASE_LENGTH,
} from "lib/constants";

export const ExpiryUnitValues = ["minutes", "hours", "days"] as const;
export type ExpiryUnit = typeof ExpiryUnitValues[number];
export type InputMethod = "fiat" | "sats";
export type TipTier = {
  amount: number;
  amountString: string;
  quantity: number;
};

export type TipFormData = {
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
  passphraseLength: number;
  generatePassphrase: boolean;
  inputMethod: InputMethod;
  claimWebhookUrl: string | undefined;
  withdrawWebhookUrl: string | undefined;
  advertisementUrl: string | undefined;
  advertisementImageUrl: string | undefined;
  type: TipType | undefined;
  enableStaticLink: boolean | undefined;
  tiers: TipTier[];
};

export type TipFormSubmitData = Omit<
  TipFormData,
  "enterIndividualNames" | "showAdvancedOptions" | "inputMethod"
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
    passphraseLength: data.passphraseLength,
    generatePassphrase: data.generatePassphrase,
    claimWebhookUrl: data.claimWebhookUrl,
    withdrawWebhookUrl: data.withdrawWebhookUrl,
    advertisementUrl: data.advertisementUrl,
    advertisementImageUrl: data.advertisementImageUrl,
  };
}
export function getSharedTipFormDefaultValues(tip: Tip) {
  const expiresIn = Math.max(
    Math.ceil(differenceInHours(new Date(tip.expiry), new Date()) / 24),
    1
  );
  return {
    currency: tip.currency || DEFAULT_FIAT_CURRENCY,
    expiresIn,
    expiryUnit: "days" as const,
    tippeeLocale: tip.tippeeLocale || undefined,
    onboardingFlow: tip.onboardingFlow,
    recommendedWalletId: tip.recommendedWalletId || undefined,
    anonymousTipper: tip.anonymousTipper,
    showAdvancedOptions: true,
    generatePassphrase: !!tip.passphrase,
    passphraseLength:
      tip.passphrase?.split(" ").length ?? DEFAULT_TIP_PASSPHRASE_LENGTH,
    amount: tip.amount,
    inputMethod: "sats" as const,
    claimWebhookUrl: tip.claimWebhookUrl || undefined,
    withdrawWebhookUrl: tip.withdrawWebhookUrl || undefined,
    advertisementUrl: tip.advertisementUrl || undefined,
    advertisementImageUrl: tip.advertisementImageUrl || undefined,
    type: tip.type,
  };
}
