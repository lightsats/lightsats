import { Loading } from "@nextui-org/react";
import { getSatsAmount } from "lib/utils";

type SatsPriceProps = {
  exchangeRate?: number;
  fiat: number;
};

export function SatsPrice({ exchangeRate, fiat }: SatsPriceProps) {
  if (!exchangeRate) {
    return <Loading color="currentColor" size="sm" />;
  }
  return <>{getSatsAmount(fiat, exchangeRate)} sats</>;
}
