import Router from 'next/router';
import { createAnalyticsQuery } from '..';
import { Routes } from '../../../../utils/constants';

export const login = (from: string, next: string) => {
	Router.push(
		createAnalyticsQuery({
			path: Routes.LOGIN,
			analytics: { from },
			query: { next },
		})
	);
};
