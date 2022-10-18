import { TipStatus } from "@prisma/client";

export const appName = "lightsats";
export const SATS_TO_BTC = 100000000;
export const DEFAULT_FIAT_CURRENCY = "USD";

export const refundableTipStatuses: TipStatus[] = ["UNCLAIMED", "CLAIMED"];
