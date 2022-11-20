import { resources } from "lib/i18n/resources";

declare module "i18next" {
  interface CustomTypeOptions {
    resources: typeof resources["en"];
  }
}
