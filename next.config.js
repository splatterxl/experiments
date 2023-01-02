const { version } = require('./package.json');

/** @type { import('next').NextConfig } */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	sentry: {
		// Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
		// for client-side builds. (This will be the default starting in
		// `@sentry/nextjs` version 8.0.0.) See
		// https://webpack.js.org/configuration/devtool/ and
		// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
		// for more information.
		hideSourceMaps: true,
	},
	publicRuntimeConfig: {
		version,
	},
	redirects: async () => {
		return [
			{
				destination: '/settings/general',
				source: '/settings',
				permanent: false,
			},
			{
				destination: '/api/v1/account/harvest/download',
				source: '/api/account/harvest/download',
				permanent: false,
			},
		];
	},
	headers: async () => {
		const isDev = process.env.NODE_ENV === 'development';

		return [
			{
				source: '/:path*',
				headers: [
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains; preload',
					},
					{
						key: 'X-XSS-Protection',
						value: '0',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
				],
			},
			{
				source: '/api/:path*',
				headers: [
					{
						key: 'Access-Control-Allow-Origin',
						value: isDev ? '*' : 'https://exps.splt.dev',
					},
					{ key: 'Accept-Post', value: 'application/json' },
					{ key: 'Accept-Patch', value: 'application/json' },
				],
			},
			{
				source: '/api/v1/:path*',
				headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
			},
		];
	},
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
	// Additional config options for the Sentry Webpack plugin. Keep in mind that
	// the following options are set automatically, and overriding them is not
	// recommended:
	//   release, url, org, project, authToken, configFile, stripPrefix,
	//   urlPrefix, include, ignore

	silent: true, // Suppresses all logs
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(
	withBundleAnalyzer(nextConfig),
	sentryWebpackPluginOptions
);
