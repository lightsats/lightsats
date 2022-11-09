import { Loading } from "@nextui-org/react";
import currencySymbol from "currency-symbol";
import unescape from "lodash.unescape";

import { getFiatAmount, roundFiat } from "lib/utils";

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

  const symbol = unescape(currencySymbol.symbol(currency));
  const fiatAmount = roundFiat(getFiatAmount(sats, exchangeRate));

  return (
    <>
      {showApprox && "~"}
      <span dangerouslySetInnerHTML={{ __html: symbol }}></span>
      {fiatAmount}
    </>
  );
}
