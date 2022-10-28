import { Loading } from "@nextui-org/react";
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
  return (
    <>
      {showApprox && "~"}
      {"$"}
      {roundFiat(getFiatAmount(sats, exchangeRate))} {currency}
    </>
  );
}
