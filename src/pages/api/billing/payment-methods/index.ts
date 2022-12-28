import { Ratelimit } from '@upstash/ratelimit';
import { Snowflake } from 'discord-api-types/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../../utils/billing/stripe';
import { checkAuth, client, redis } from '../../../../utils/database';
import { PaymentMethod } from '../../../../utils/types';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(1, '2 s'),
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		{ message: string; reset_after?: number } | PaymentMethod[]
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

	const customers = await client
		.collection<{
			customer_id: string;
			user_id: Snowflake;
		}>('customers')
		.find({ user_id: user.id })
		.toArray();

	const result = [];

	for (const customer of customers) {
		result.push(
			...(await stripe.customers
				.listPaymentMethods(customer.customer_id, {} as any)
				.then((res) => res.data))
		);
	}

	res.status(200).send(result);
}
