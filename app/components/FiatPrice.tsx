import { Loading, Tooltip } from "@nextui-org/react";
import {
  getFiatAmount,
  getSymbolFromCurrencyWithFallback,
  roundFiat,
} from "lib/utils";

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
    return <Loading color="currentColor" size="sm" />;
  }

  const symbol = getSymbolFromCurrencyWithFallback(currency);
  const fiatAmount = roundFiat(getFiatAmount(sats, exchangeRate));

  return (
    <Tooltip content={symbol + fiatAmount + " " + currency}>
      <>
        {showApprox && "~"}
        <span>{symbol}</span>
        {fiatAmount}
      </>
    </Tooltip>
  );
}
