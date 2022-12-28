// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (process.env.NODE_ENV !== 'development')
	Sentry.init({
		environment: process.env.NODE_ENV,
		dsn:
			SENTRY_DSN ||
			'https://352f8e9b23364aa284aaf79fd69cf727@o917511.ingest.sentry.io/4504368705830912',
		tracesSampleRate: 1.0,
		autoSessionTracking: false,
		initialScope: (scope) => {
			/**
			 * @type {import('discord-api-types/v10').APIUser}
			 */
			const user = JSON.parse(localStorage.getItem('user') ?? 'null');

			if (user)
				scope.setUser({
					email: user.email ?? undefined,
					id: user.id,
					username: user.username,
				});

			return scope;
		},
		// ...
		// Note: if you want to override the automatic release value, do not set a
		// `release` value here - use the environment variable `SENTRY_RELEASE`, so
		// that it will also get attached to your source maps
	});
