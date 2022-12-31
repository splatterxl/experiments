import getConfig from 'next/config';

const keys = ['referrer', 'source', 'campaign', 'from'];

export const createAnalyticsQuery = (options: Partial<RoutingOptions>) => {
	return `${options.path}?${new URLSearchParams({
		...options.analytics,
		...options.query,
	}).toString()}`;
};

export interface RoutingOptions {
	path: string;
	analytics: {
		from?: string;
		source?: string;
		campaign?: string;
	};
	query: Record<string, any>;
}

export interface AppProperties {
	app_version: number;
	app_environment: string;
	browser_user_agent: string;
	browser_locale: string;
	platform: string;
}

export const {
	publicRuntimeConfig: { version: APP_VERSION },
}: { publicRuntimeConfig: { version: number } } = getConfig();

export const getProperties = (): AppProperties => {
	return {
		app_version: APP_VERSION,
		app_environment: process.env.NODE_ENV,
		browser_user_agent: navigator.userAgent,
		browser_locale: navigator.language,
		platform: navigator.platform,
	};
};
