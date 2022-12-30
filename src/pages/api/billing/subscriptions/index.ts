import { checkAuth } from '@/lib/auth/request';
import {
	getDbSubscriptions,
	getSubscriptionData,
} from '@/lib/billing/subscriptions';
import { SubscriptionData } from '@/lib/billing/types';
import { redis } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(1, '2 s'),
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		SubscriptionData[] | { message: string; reset_after?: number }
	>
) {
	const user = await checkAuth(req, res);

	if (!user) return;

	const identifier = 'subscriptions:' + user.id;
	const result = await ratelimit.limit(identifier);
	res.setHeader('X-RateLimit-Limit', result.limit);
	res.setHeader('X-RateLimit-Remaining', result.remaining);
	res.setHeader('X-RateLimit-Reset', result.reset);

	if (!result.success) {
		res
			.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
			.status(429)
			.json(Errors[ErrorCodes.USER_LIMIT]((result.reset - Date.now()) / 1000));
		return;
	}

	const subscriptions = await getDbSubscriptions(user.id);

	if (subscriptions.length) {
		const subs = await Promise.all(
			subscriptions.map((sub) => getSubscriptionData(sub, false))
		);

		return res.send(subs.filter((v) => !v.cancelled));
	} else {
		return res.send([]);
	}
}
