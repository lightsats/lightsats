import i18next, { TFunction, TOptions } from "i18next";
import Backend from "i18next-fs-backend";
import { AllNamespaces, resources } from "lib/i18n/resources";
import * as path from "path";

export function getApiI18n(locale: string) {
  return i18next.use(Backend).init({
    lng: locale,
    ns: Object.keys(resources["en"]),
    backend: {
      loadPath: path.join(process.cwd(), "/public/locales/{{lng}}/{{ns}}.json"),
    },
  }) as unknown as Promise<ApiI18n>;
}

export type ApiI18n = <T extends AllNamespaces>(
  key: Parameters<TFunction<T, undefined>>[0],
  options: { ns: T } & TOptions<object>
) => string;
