import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import {
	checkAuth,
	client,
	redis,
	Subscription,
} from '../../../../utils/database';
import { SubscriptionData } from '../../../../utils/types';
import { getSubscriptionData } from './[id]';

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
			.json({
				message: 'You are being rate limited.',
				reset_after: (result.reset - Date.now()) / 1000,
			});
		return;
	}

	const coll = client.collection<Subscription>('subscriptions');

	let subscriptions = await coll
		.find({
			user_id: user.id,
		})
		.toArray();

	if (subscriptions.length) {
		const subs = await Promise.all(
			subscriptions.map((sub) => getSubscriptionData(sub, false, coll))
		);

		return res.send(subs.filter((v) => !v.cancelled));
	} else {
		return res.send([]);
	}
}
