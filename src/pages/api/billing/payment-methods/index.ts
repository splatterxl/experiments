import { checkAuth } from '@/lib/auth/request';
import {
	getCustomer,
	listPaymentMethods,
} from '@/lib/billing/stripe/customers';
import { PaymentMethod } from '@/lib/billing/types';
import { getCustomer as getDbCustomer, redis } from '@/lib/db';
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
			.json(Errors[ErrorCodes.USER_LIMIT]((rl.reset - Date.now()) / 1000));
		return;
	}

	const customer = await getDbCustomer(user.id);

	if (!customer) return res.send([]);

	const stripeCustomer = await getCustomer(customer.customer_id, []);

	if (stripeCustomer.deleted)
		return res.status(422).send({ message: 'Deleted customer' });

	const result = await listPaymentMethods(
		stripeCustomer.id,
		undefined as any,
		[]
	).then((res) =>
		res.data.map((v) => ({
			...v,
			default: stripeCustomer.invoice_settings.default_payment_method === v.id,
		}))
	);

	res.send(result);
}
