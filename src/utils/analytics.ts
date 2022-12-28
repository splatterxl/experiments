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
