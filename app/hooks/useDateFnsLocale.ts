import * as dateFnsLocales from "date-fns/locale";
import { DEFAULT_LOCALE } from "lib/locales";
export function useDateFnsLocale(locale: string | undefined) {
  // TODO: this should be a dynamic import
  return (dateFnsLocales as { [key: string]: Locale })[
    locale || DEFAULT_LOCALE
  ];
}
