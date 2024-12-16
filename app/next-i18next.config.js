module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: [
      "de",
      "en",
      "es",
      "fr",
      "nl",
      "nb",
      "pt-BR",
      "ar",
      "th",
      "sl",
      "id",
    ],
  },
  reloadOnPrerender: process.env.NEXT_PUBLIC_RELOAD_I18N === "true",
};
