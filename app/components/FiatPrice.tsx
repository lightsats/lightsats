import { Loading } from "@nextui-org/react";
import { SATS_TO_BTC } from "../lib/constants";

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
      {(exchangeRate * (sats / SATS_TO_BTC)).toFixed(2)} {currency}
    </>
  );
}
