import { Snowflake } from 'discord-api-types/globals';

export const Endpoints = {
	LIST_NELLY: 'https://nelly.tools/api/experiments',
	LIST_AETHER: 'https://aether.gaminggeek.dev/v2/discexp',
};

export const APIEndpoints = {
	HARVEST: '/account/harvest',
	DOWNLOAD_HARVEST: '/account/harvest/download',

	CHECKOUT: '/billing/checkout',

	SUBSCRIPTION: (id: string) => `/billing/subscriptions/${id}`,

	PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,

	LOGIN: '/auth/login',
	DISCORD_CALLBACK: '/auth/discord',
	LOGOUT: '/auth/logout',

	GUILDS: '/user/guilds',
	ME: '/user',
};

export const makeURL = (endpoint: string, query: Record<string, any> = {}) => {
	const url = `/api${endpoint}`;

	const search = new URLSearchParams(query).toString();

	return `${url}${search ? `?${search}` : ''}`;
};

export const Routes = {
	LOGIN: '/auth/login',
	LOGIN_TO: (next: string) => `/auth/login?next=${next}`,
	LOGIN_TRY_AGAIN: '/auth/login/try-again',
	LOGIN_ONBOARDING: (next?: string, scope?: string) =>
		`/auth/login/onboarding${next ? `?next=${next}` : ''}${
			scope ? `${next ? '&' : '?'}scope=${scope}` : ''
		}`,

	LOGOUT: '/auth/logout',

	PREMIUM: '/premium',
	LIFTOFF: (subscription: string, product: string) =>
		`/premium/liftoff?product=${encodeURIComponent(
			product
		)}&subscription=${subscription}`,
	REASSIGN_SUBSCRIPTION: (sub: string, product: string, previous?: Snowflake) =>
		`/premium/liftoff?prev_guild_id=${previous}&subscription=${sub}&product=${encodeURIComponent(
			product
		)}`,

	TERMS: '/terms',
	PRIVACY: '/privacy',
	RETURNS: '/returns',

	HOME: '/',

	UPDATES: '/',
	GET_STARTED: '/get-started',

	SETTINGS: '/settings',

	SERVER_SETTINGS: '/settings/servers',
	SERVER_LIFTOFF: (guild: Snowflake, product: string) =>
		`/dashboard/guilds/${guild}/${product}/liftoff`,

	ACCOUNT_SETTINGS: '/settings/account',

	BILLING_SETTINGS: '/settings/billing',
	SUBSCRIPTION_SETTINGS: (sub: string) =>
		`/settings/billing/subscriptions/${sub}`,
	PAYMENT_METHOD_SETTINGS: (pm: string) =>
		`/settings/billing/payment-methods/${pm}`,

	DASHBOARD: '/dashboard',
};
