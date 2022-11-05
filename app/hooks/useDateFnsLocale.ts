import * as dateFnsLocales from "date-fns/locale";
export function useDateFnsLocale(locale: string | undefined) {
  // TODO: this should be a dynamic import
  return (dateFnsLocales as { [key: string]: Locale })[locale || "en"];
}
