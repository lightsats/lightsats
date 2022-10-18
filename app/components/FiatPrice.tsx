import { Loading } from "@nextui-org/react";
import { getFiatAmount, roundFiat } from "lib/utils";

type FiatPriceProps = {
  currency: string;
  exchangeRate?: number;
  sats: number;
};

export function FiatPrice({ currency, exchangeRate, sats }: FiatPriceProps) {
  if (!exchangeRate) {
    return <Loading type="spinner" color="currentColor" size="sm" />;
  }
  return (
    <>
      {"~$"}
      {roundFiat(getFiatAmount(sats, exchangeRate))} {currency}
    </>
  );
}
