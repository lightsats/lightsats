import { User } from "@prisma/client";
import { format } from "date-fns";
import { FEE_PERCENT, MINIMUM_FEE_SATS, SATS_TO_BTC } from "lib/constants";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { MouseEventHandler } from "react";
import { Item } from "types/Item";

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

export function calculateFee(amount: number) {
  // always round fees UP to nearest sat value, to simplify calculations and make sure fees are always sufficient
  return Math.max(MINIMUM_FEE_SATS, Math.ceil(amount * (FEE_PERCENT / 100)));
}

export function generateAlphanumeric(length: number): string {
  return Array.from(Array(length), () =>
    Math.floor(Math.random() * 36).toString(36)
  )
    .join("")
    .toUpperCase();
}

export function getUserAvatarUrl(user: User | undefined) {
  return getAvatarUrl(user?.avatarURL ?? undefined, getFallbackAvatarId(user));
}
export function getAvatarUrl(avatarUrl: string | undefined, fallbackId = "1") {
  return avatarUrl?.length ? avatarUrl : `https://robohash.org/${fallbackId}`;
}

// from https://stackoverflow.com/a/34842797/4562693
export const getHashCode = (s: string) =>
  s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

export function getFallbackAvatarId(user: User | undefined) {
  if (!user) {
    return undefined;
  }
  const secretId = user?.email ?? user?.lnurlPublicKey;
  if (!secretId) {
    return undefined;
  }

  return (getHashCode(secretId) % 10000).toString();
}

export function nth(n: number) {
  return ["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th";
}

export const getDateLabel = (date: Date) => format(date, "d/M");

export const stringifyError = (error: Error) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error));

export const getItemImageLocation = (item: Item) =>
  `/items/${item.category}/${item.image}`;

export const getLocalePath = (locale = DEFAULT_LOCALE) =>
  locale !== DEFAULT_LOCALE ? `${locale}/` : "";
