import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import {
	checkAuth,
	client,
	redis,
	Subscription
} from '../../../../utils/database';
import { getGuilds } from '../../user/guilds';
import { getSubscriptionData, SubscriptionData } from './[id]';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(5, '5 s')
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		SubscriptionData[] | { message: string; reset_after?: number }
	>
) {
	const user = await checkAuth(req, res);

	if (!user) return;

	const identifier = 'checkout:' + user.id;
	const result = await ratelimit.limit(identifier);
	res.setHeader('X-RateLimit-Limit', result.limit);
	res.setHeader('X-RateLimit-Remaining', result.remaining);
	res.setHeader('X-RateLimit-Reset', result.reset);

	if (!result.success) {
		res.status(429).json({
			message: 'You are being rate limited.',
			reset_after: (result.reset - Date.now()) / 1000
		});
		return;
	}

	const guilds = await getGuilds(user.access_token);

	if (!guilds) return res.status(502).send({ message: 'Bad Gateway' });

	const coll = client.collection<Subscription>('subscriptions');

	const subscriptions = await coll
		.find({
			user_id: user.id
		})
		.toArray()
		.then((subs) =>
			Promise.all(
				subs.map((sub) => getSubscriptionData(sub, guilds, false, coll))
			)
		);

	// repair on read to delete cancelled subs
	// TODO: listen to stripe webhook customer.subscription.delete
	for (const sub of subscriptions) {
		if (sub.cancelled) {
			await coll.deleteMany({
				subscription_id: sub.id
			});
		}
	}

	return res.send(subscriptions.filter((v) => !v.cancelled));
}
