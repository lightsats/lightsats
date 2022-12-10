// eslint-disable-next-line no-restricted-imports, @typescript-eslint/no-var-requires
const { i18n } = require("./next-i18next.config");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  sentry: {
    hideSourceMaps: false,
    autoInstrumentServerFunctions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/scoreboard",
        destination: "/leaderboard",
        permanent: true,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  disableServerWebpackPlugin: false,
  disableClientWebpackPlugin: false,
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
