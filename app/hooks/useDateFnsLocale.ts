import * as dateFnsLocales from "date-fns/locale";
import { DEFAULT_LOCALE } from "lib/i18n/locales";
import { useRouter } from "next/router";
export function useDateFnsLocale() {
  const router = useRouter();
  // TODO: this should be a dynamic import
  return (dateFnsLocales as { [key: string]: Locale })[
    router.locale || DEFAULT_LOCALE
  ];
}
