import achievements from "public/locales/en/achievements.json";
import claim from "public/locales/en/claim.json";
import common from "public/locales/en/common.json";
import email from "public/locales/en/email.json";
import login from "public/locales/en/login.json";
import tip from "public/locales/en/tip.json";

export const resources = {
  en: {
    common,
    claim,
    email,
    login,
    achievements,
    tip,
  },
} as const;

export type AllNamespaces = keyof typeof resources["en"];
