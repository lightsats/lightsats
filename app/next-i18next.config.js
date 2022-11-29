module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "th", "pt-BR", "de", "es", "fr"],
  },
  reloadOnPrerender: process.env.NEXT_PUBLIC_RELOAD_I18N === "true",
};
