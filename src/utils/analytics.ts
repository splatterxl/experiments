import { NextRouter } from 'next/router';

const keys = ['referrer', 'source', 'campaign', 'from'];

export const cleanURL = (router: NextRouter) => {
	if (keys.some((v) => Object.keys(router?.query ?? {}).includes(v))) {
		console.log(router.query);

		for (const key of keys) {
			delete router.query[key];
		}

		router.replace({
			pathname: router.pathname,
			query: {
				...router.query,
			},
		});
	}
};

export const createAnalyticsQuery = (options: Partial<RoutingOptions>) => {
	return {
		pathname: options.path,
		query: new URLSearchParams({
			...options.analytics,
			...options.query,
		}).toString(),
	};
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
