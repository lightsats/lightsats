import { Loading } from "@nextui-org/react";

import { getFiatAmount } from "lib/utils";

type FiatPriceProps = {
  currency: string;
  exchangeRate?: number;
  sats: number;
  showApprox?: boolean;
};

export function FiatPrice({
  currency,
  exchangeRate,
  sats,
  showApprox,
}: FiatPriceProps) {
  if (!exchangeRate) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }

  const fiatAmount = getFiatAmount(sats, exchangeRate);
  const formattedCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  })
    .formatToParts(fiatAmount)
    .map((val) => val.value)
    .join("");

  return (
    <>
      {showApprox && "~"}
      {formattedCurrency}
    </>
  );
}
