import achievements from "public/locales/en/achievements.json";
import claim from "public/locales/en/claim.json";
import common from "public/locales/en/common.json";
import email from "public/locales/en/email.json";

export const resources = {
  en: {
    common,
    claim,
    email,
    achievements,
  },
} as const;

export type AllNamespaces = keyof typeof resources["en"];
