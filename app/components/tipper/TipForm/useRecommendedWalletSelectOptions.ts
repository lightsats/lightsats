import { OnboardingFlow } from "@prisma/client";
import { SelectOption } from "components/CustomSelect";
import { getRecommendedItems } from "lib/items/getRecommendedItems";
import React from "react";

export function useRecommendedWalletSelectOptions(
  satsAmount: number,
  onboardingFlow: OnboardingFlow
) {
  const recommendedWalletSelectOptions: SelectOption[] = React.useMemo(
    () =>
      getRecommendedItems("wallets", undefined, undefined, {
        checkTippeeBalance: true,
        filterOtherItems: true,
        lnurlAuthCapable: onboardingFlow === "LIGHTNING",
        tippeeBalance: satsAmount,
        sortAlphabetically: true,
      }).map((wallet) => ({
        value: wallet.id,
        label: wallet.name,
      })),
    [satsAmount, onboardingFlow]
  );
  return recommendedWalletSelectOptions;
}
