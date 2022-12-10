import { TipStatus } from "@prisma/client";

export const appName = "Lightsats";
export const SATS_TO_BTC = 100000000;
export const DEFAULT_FIAT_CURRENCY = "USD";
export const MIN_TIP_SATS = 1;
export const MAX_TIP_SATS = 1000000;
export const MAX_USER_NAME_LENGTH = 50;
export const DEFAULT_NAME = "Anon";
export const FEE_PERCENT = 1;
export const MINIMUM_FEE_SATS = 10;
export const TIP_NUM_SMS_TOKENS = 3;
export const LOGIN_LINK_EXPIRATION_DAYS = 30;
export const DEFAULT_PAGE_SIZE = 10;
export const USE_PREV_TIP_PROPERTIES = true;
export const DEFAULT_LEADERBOARD_ID = "default";
export const LIGHTSATS_INCEPTION = new Date("2022-10-01");

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

export const placeholderDataUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAABJ0AAASdAHeZh94AAAAAmJLR0QAAd2KE6QAAAAHdElNRQfmCwYODiT2bNinAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTExLTA2VDE0OjE0OjM2KzAwOjAwu1S7CwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMS0wNlQxNDoxNDozNiswMDowMMoJA7cAAAANSURBVBhXY2BgYPgPAAEEAQBwIGULAAAAAElFTkSuQmCC`;
