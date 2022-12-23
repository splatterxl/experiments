import Router from 'next/router';
import { createAnalyticsQuery } from '../analytics';

export const login = (from: string, next: string) => {
	Router.push(
		createAnalyticsQuery({
			path: `/auth/login?next=${next}`,
			analytics: { from }
		})
	);
};
