import Router from 'next/router';
import { createAnalyticsQuery } from '../analytics';

export const login = (from: string) => {
	Router.push(
		createAnalyticsQuery({
			path: '/auth/login',
			analytics: { from }
		})
	);
};
