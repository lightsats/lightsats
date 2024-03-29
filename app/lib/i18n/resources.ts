import achievements from "public/locales/en/achievements.json";
import claim from "public/locales/en/claim.json";
import common from "public/locales/en/common.json";
import email from "public/locales/en/email.json";
import guide from "public/locales/en/guide.json";
import items from "public/locales/en/items.json";
import journey from "public/locales/en/journey.json";
import login from "public/locales/en/login.json";
import tip from "public/locales/en/tip.json";
import withdraw from "public/locales/en/withdraw.json";

export const resources = {
  en: {
    common,
    claim,
    email,
    login,
    achievements,
    tip,
    items,
    withdraw,
    journey,
    guide,
  },
} as const;

export type AllNamespaces = keyof typeof resources["en"];
