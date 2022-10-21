import { TipStatus } from "@prisma/client";

export const appName = "lightsats";
export const SATS_TO_BTC = 100000000;
export const DEFAULT_FIAT_CURRENCY = "USD";
export const MIN_TIP_SATS = 1;
export const MAX_USER_NAME_LENGTH = 50;
export const DEFAULT_NAME = "anon";

export const refundableTipStatuses: TipStatus[] = [
  "UNCLAIMED",
  "CLAIMED",
  "WITHDRAWAL_FAILED",
];

export const expirableTipStatuses: TipStatus[] = [
  "UNFUNDED",
  "UNCLAIMED",
  "CLAIMED",
];
