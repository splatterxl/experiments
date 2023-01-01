import handle from '@/lib/api/schema';
import { checkAuth } from '@/lib/auth/request';
import {
	getCustomer,
	setCustomerDefaultPaymentMethod,
} from '@/lib/billing/stripe/customers';
import { getPaymentMethod } from '@/lib/billing/stripe/paymentMethods';
import { PaymentMethod } from '@/lib/billing/types';
import { redis } from '@/lib/db';
import { customers } from '@/lib/db/collections';
import { ErrorCodes, Errors } from '@/lib/errors';
import { s } from '@sapphire/shapeshift';
import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { one } from '../../../../utils';

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
			.json(Errors[ErrorCodes.USER_LIMIT]((rl.reset - Date.now()) / 1000));
		return;
	}

	const id = one(req.query.id);

	if (!id?.startsWith('pm_')) {
		return res.status(400).send(Errors[ErrorCodes.INVALID_PAYMENT_METHOD_ID]);
	}

	let result: Stripe.PaymentMethod;
	try {
		result = await getPaymentMethod(id, ['customer']);
	} catch (err: any) {
		const status = err.message.startsWith('No such') ? 404 : 502;

		return res
			.status(status)
			.send(
				status === 404
					? Errors[ErrorCodes.UNKNOWN_PAYMENT_METHOD]
					: Errors[ErrorCodes.BAD_GATEWAY]
			);
	}

	if (result.metadata?.user_id !== user.id) {
		return res.status(404).send(Errors[ErrorCodes.UNKNOWN_PAYMENT_METHOD]);
	}

	const coll = customers();

	let customer = await coll
		.findOne({ user_id: user.id })
		.then((v) => v?.customer_id);

	if (!customer) {
		if (result.customer) {
			customer = result.customer as string;

			await coll.insertOne({ user_id: user.id, customer_id: customer });
		} else {
			return res.status(422).send(Errors[ErrorCodes.UNPROCESSABLE_ENTITY]);
		}
	}

	const stripeCustomer =
		(result.customer as Stripe.Customer) ?? (await getCustomer(customer, []));

	if (stripeCustomer.deleted)
		return res.status(422).send({ message: 'Deleted customer' });

	switch (req.method) {
		case 'PATCH': {
			const body = handle(
				req,
				res,
				s.object({
					default: s.boolean.optional,
				})
			);

			if (!body) return;

			if ('default' in body) {
				if (typeof body.default !== 'boolean')
					return res.status(400).send({ message: 'Invalid request body' });

				try {
					await setCustomerDefaultPaymentMethod(customer, id);
				} catch (err: any) {
					return res
						.status(500)
						.send(Errors[ErrorCodes.INTERNAL_SERVER_ERROR](err));
				}
			}
		}
		case 'GET':
			return res.status(200).send({
				id: result.id,
				type: result.type,
				exp: result.card?.exp_year
					? `${result.card.exp_month}/${result.card.exp_year}`
					: null,
				email: result.billing_details.email,
				brand: result.card?.brand ?? null,
				wallet: result.card?.wallet ?? null,
				last4: result.card?.last4 ?? null,
				eps: result.eps?.bank ?? null,
				ideal: result.ideal?.bank ?? null,
				default:
					(stripeCustomer.invoice_settings.default_payment_method as string) ===
					result.id,
			});
	}
}
