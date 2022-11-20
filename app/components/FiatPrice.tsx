import { Loading, Tooltip } from "@nextui-org/react";
import getSymbolFromCurrency from "currency-symbol-map";
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
    return <Loading color="currentColor" size="sm" />;
  }

  const symbol = getSymbolFromCurrency(currency);
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
