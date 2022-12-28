import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { one } from '../../../../utils';
import { stripe } from '../../../../utils/billing/stripe';
import { checkAuth, redis } from '../../../../utils/database';
import { PaymentMethod } from '../../../../utils/types';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(1, '2 s'),
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		{ message: string; reset_after?: number } | PaymentMethod
	>
) {
	const user = await checkAuth(req, res);

	if (!user) return;

	const identifier = 'payment_methods:' + user.id;
	const rl = await ratelimit.limit(identifier);
	res.setHeader('X-RateLimit-Limit', rl.limit);
	res.setHeader('X-RateLimit-Remaining', rl.remaining);
	res.setHeader('X-RateLimit-Reset', rl.reset);

	if (!rl.success) {
		res
			.setHeader('Retry-After', (rl.reset - Date.now()) / 1000)
			.status(429)
			.json({
				message: 'You are being rate limited.',
				reset_after: (rl.reset - Date.now()) / 1000,
			});
		return;
	}

	const id = one(req.query.id);

	if (!id) {
		return res.status(400).send({ message: 'Invalid payment method ID' });
	}

	let result: Stripe.PaymentMethod;
	try {
		result = await stripe.paymentMethods.retrieve(id);
	} catch (err: any) {
		return res
			.status(err.message.startsWith('No such') ? 404 : 502)
			.send({ message: err.message });
	}

	if (result.metadata?.user_id !== user.id) {
		return res.status(403).send({ message: 'Missing Access' });
	}

	res.status(200).send(result);
}
