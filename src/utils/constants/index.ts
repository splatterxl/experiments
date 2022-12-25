export const Endpoints = {
	LIST_NELLY: 'https://nelly.tools/api/experiments',
	LIST_AETHER: 'https://aether.gaminggeek.dev/v2/discexp'
};

export const APIEndpoints = {
	HARVEST: '/account/harvest',
	DOWNLOAD_HARVEST: '/account/harvest/download',

	CHECKOUT: '/billing/checkout',

	SUBSCRIPTIONS: '/billing/subscriptions',
	SUBSCRIPTION: (id: string) => `/billing/subscriptions/${id}`,

	PAYMENT_METHODS: '/billing/payment-methods',
	PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,

	LOGIN: '/auth/login',
	DISCORD_CALLBACK: '/auth/discord',
	LOGOUT: '/auth/logout',

	GUILDS: '/user/guilds'
};

export const makeURL = (endpoint: string, query: Record<string, any> = {}) => {
	const url = `/api/${endpoint}`;

	const search = new URLSearchParams(query).toString();

	return `${url}${search ? `?${search}` : ''}`;
};
