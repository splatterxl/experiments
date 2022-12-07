import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../utils';
import { stripe } from '../../../utils/billing/stripe';
import { Prices, Products } from '../../../utils/constants/billing';

export default async function checkout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect('/auth/login');

	const host = req.headers.host;

	if (!host) return res.status(400).send({ error: 'Invalid host' });

	const url = new URL(
		req.url!,
		process.env.NODE_ENV === 'development'
			? `http://${host}`
			: `https://${host}`
	);

	let { discord_user_id: user, price = 'monthly' } = req.query;
	user = one(user);
	price = one(price)!;

	let product: Products = one(req.query.product) as any;

	if (user && isNaN(parseInt(user)))
		return res.status(400).send({ error: 'Invalid user' });

	if (product) {
		const str = product.toString();
		const int = parseInt(str);

		if (!isNaN(int) && typeof Products[int] !== 'undefined') {
			product = int;
		} else {
			product = Products[str.toString() as keyof typeof Products];
		}

		if (!product) return res.status(400).send({ error: 'Invalid product' });
	} else {
		product = Products.PREMIUM;
	}

	if (!['monthly', 'yearly'].includes(price))
		return res.status(400).send({ error: 'Invalid price' });

	const trial = one(req.query.trial) ?? 'true';

	if (!['true', 'false'].includes(trial))
		return res.status(400).send({ error: 'Invalid trial' });

	const shouldIncludeTrial = trial === 'true';

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: Prices[product][price.toUpperCase()],
				quantity: 1
			}
		],
		mode: 'subscription',
		subscription_data: shouldIncludeTrial ? { trial_period_days: 3 } : {},
		metadata: { discord_user_id: user ?? null },
		success_url: `${url.origin}/api/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/billing/cancel`
	});

	return res.redirect(session.url!);
}
