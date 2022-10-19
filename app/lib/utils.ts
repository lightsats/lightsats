import { SATS_TO_BTC } from "lib/constants";
import { MouseEventHandler } from "react";

export function getSatsAmount(fiat: number, exchangeRate: number) {
  return Math.ceil((fiat / exchangeRate) * SATS_TO_BTC);
}

export function getFiatAmount(sats: number, exchangeRate: number) {
  return exchangeRate * (sats / SATS_TO_BTC);
}

export function roundFiat(fiat: number) {
  return fiat.toFixed(2);
}

export const fixNextUIButtonLink: MouseEventHandler<HTMLButtonElement> = (
  e
) => {
  e?.preventDefault();
};
