import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../utils';
import { stripe } from '../../../utils/billing/stripe';
import { Prices, Products } from '../../../utils/constants/billing';
import { checkAuth, redis } from '../../../utils/database';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(3, '10 m')
});

export default async function checkout(
	req: NextApiRequest,
	res: NextApiResponse
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

	const { email } = user;

	const host = req.headers.host;

	if (!host) return res.status(400).send({ error: 'Invalid host' });

	const url = new URL(
		req.url!,
		process.env.NODE_ENV === 'development'
			? `http://${host}`
			: `https://${host}`
	);

	let { discord_guild_id: guild, price = 'monthly' } = req.query;
	guild = one(guild);
	price = one(price)!;

	let product: Products = one(req.query.product)?.toUpperCase() as any;

	if (guild && isNaN(parseInt(guild)))
		return res.status(400).send({ error: 'Invalid guild' });

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

	if (price === 'yearly' && product === Products.MAILING_LIST)
		return res
			.status(404)
			.send({ error: 'Mailing list does not have yearly billing' });

	if (process.env.NODE_ENV !== 'development')
		return res.status(400).send('The Maze was not meant for you.');

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: Prices[product][price.toUpperCase()],
				quantity: 1
			}
		],
		mode: 'subscription',
		subscription_data: shouldIncludeTrial ? { trial_period_days: 7 } : {},
		metadata: { discord_guild_id: guild ?? null },
		success_url: `${url.origin}/api/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/premium`,
		customer_email: email!,
		allow_promotion_codes: true,
		consent_collection: {
			terms_of_service: 'required'
		}
	});

	return res.redirect(session.url!);
}
