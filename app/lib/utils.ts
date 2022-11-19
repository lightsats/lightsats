import { Tip, User } from "@prisma/client";
import { format, isAfter } from "date-fns";
import {
  expirableTipStatuses,
  FEE_PERCENT,
  MINIMUM_FEE_SATS,
  SATS_TO_BTC,
} from "lib/constants";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { Routes } from "lib/Routes";
import { NextRouter } from "next/router";
import { MouseEventHandler } from "react";
import { Item } from "types/Item";
import { PublicTip } from "types/PublicTip";
import { PublicUser } from "types/PublicUser";

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

export function getUserAvatarUrl(user: User | PublicUser | undefined) {
  return getAvatarUrl(user?.avatarURL ?? undefined, getFallbackAvatarId(user));
}
export function getAvatarUrl(avatarUrl: string | undefined, fallbackId = "1") {
  return avatarUrl?.length
    ? avatarUrl
    : `https://avatars.dicebear.com/api/miniavs/${fallbackId}.svg`;
}

// from https://stackoverflow.com/a/34842797/4562693
export const getHashCode = (s: string) =>
  s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

export function getFallbackAvatarId(user: User | PublicUser | undefined) {
  if (!user) {
    return undefined;
  }

  return (getHashCode(user.id) % 10000).toString();
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
  locale !== DEFAULT_LOCALE ? `/${locale}` : "";

export const getAppUrl = () =>
  global.window ? window.location.origin : process.env.APP_URL;

export const getCurrentUrl = (router: NextRouter) => {
  return global.window
    ? window.location.href
    : getAppUrl() + getLocalePath(router.locale) + router.pathname;
};

export const hasTipExpired = (tip: Tip | PublicTip) =>
  expirableTipStatuses.indexOf(tip.status) >= 0 &&
  isAfter(new Date(), new Date(tip.expiry));

export const formatAmount = (amount: number, decimals = 2) => {
  let i = 0;
  for (i; amount >= 1000; i++) {
    amount /= 1000;
  }
  return amount.toFixed(i > 0 ? decimals : 0) + ["", " k", " M", "G"][i];
};

export const getClaimUrl = (tip: Tip) =>
  `${getAppUrl()}${getLocalePath(tip.tippeeLocale)}${Routes.tips}/${
    tip.id
  }/claim`;
