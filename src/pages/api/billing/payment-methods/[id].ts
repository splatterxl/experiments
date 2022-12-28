import { Ratelimit } from '@upstash/ratelimit';
import { Snowflake } from 'discord-api-types/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { one } from '../../../../utils';
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
		result = await stripe.paymentMethods.retrieve(id, { expand: ['customer'] });
	} catch (err: any) {
		return res
			.status(err.message.startsWith('No such') ? 404 : 502)
			.send({ message: err.message });
	}

	if (result.metadata?.user_id !== user.id) {
		return res.status(403).send({ message: 'Missing Access' });
	}

	const coll = client.collection<{
		customer_id: string;
		user_id: Snowflake;
	}>('customers');

	let customer = await coll
		.findOne({ user_id: user.id })
		.then((v) => v?.customer_id);

	if (!customer) {
		if (result.customer) {
			customer = result.customer as string;

			await coll.insertOne({ user_id: user.id, customer_id: customer });
		} else {
			return res.status(500).send({ message: 'Internal Server Error' });
		}
	}

	const stripeCustomer =
		(result.customer as Stripe.Customer) ??
		(await stripe.customers.retrieve(customer));

	if (stripeCustomer.deleted)
		return res.status(422).send({ message: 'Deleted customer' });

	switch (req.method) {
		case 'PATCH': {
			const { body } = req;

			if ('default' in body) {
				if (typeof body.default !== 'boolean')
					return res.status(400).send({ message: 'Invalid request body' });

				try {
					await stripe.customers.update(customer, {
						invoice_settings: {
							default_payment_method: result.id,
						},
					});
				} catch (err: any) {
					return res.status(422).send({ message: err.message });
				}
			}
		}
		case 'GET':
			return res.status(200).send({
				...result,
				customer: stripeCustomer.id,
				default:
					(stripeCustomer.invoice_settings.default_payment_method as string) ===
					result.id,
			});
	}
}
