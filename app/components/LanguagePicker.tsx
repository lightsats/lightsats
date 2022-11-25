import { Dropdown } from "@nextui-org/react";
import { getNativeLanguageName } from "lib/i18n/iso6391";
import { DEFAULT_LOCALE, locales } from "lib/i18n/locales";
import { switchRouterLocale } from "lib/utils";
import { useRouter } from "next/router";
import React from "react";

export function LanguagePicker() {
  const router = useRouter();
  const currentLocale = router.locale || DEFAULT_LOCALE;

  const setSelectedLocale = React.useCallback(
    (keys: unknown) => {
      // redirect to the same page on the new locale
      const nextLocale = Array.from(keys as Iterable<string>)[0];
      switchRouterLocale(router, nextLocale);
    },
    [router]
  );

  const selectedLocales = React.useMemo(
    () => new Set([currentLocale]),
    [currentLocale]
  );

  return (
    <Dropdown>
      <Dropdown.Button flat auto size="sm" css={{ px: 5 }}>
        {currentLocale.toUpperCase()}
      </Dropdown.Button>
      <Dropdown.Menu
        aria-label="Select Language"
        selectionMode="single"
        selectedKeys={selectedLocales}
        onSelectionChange={setSelectedLocale}
      >
        {locales.map((locale) => (
          <Dropdown.Item key={locale}>
            {locale.toUpperCase()}&nbsp;|&nbsp;{getNativeLanguageName(locale)}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
