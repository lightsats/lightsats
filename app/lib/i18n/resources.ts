import claim from "public/locales/en/claim.json";
import common from "public/locales/en/common.json";
import email from "public/locales/en/email.json";
import login from "public/locales/en/login.json";

export const resources = {
  en: {
    common,
    claim,
    email,
    login,
  },
} as const;

export type AllNamespaces = keyof typeof resources["en"];
