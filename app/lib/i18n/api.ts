import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as path from "path";

export function getApiI18n(locale: string, ns: string | string[] = "common") {
  return i18next.use(Backend).init({
    lng: locale,
    ns,
    backend: {
      loadPath: path.join(process.cwd(), "/public/locales/{{lng}}/{{ns}}.json"),
    },
  });
}
