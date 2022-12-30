import { checkAuth } from '@/lib/auth/request';
import { Prices, Products } from '@/lib/billing/constants';
import { stripe } from '@/lib/billing/stripe';
import { getSubscriptionCount } from '@/lib/billing/subscriptions';
import { getCustomer, redis } from '@/lib/db';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getOrigin } from '@/lib/util';
import { Ratelimit } from '@upstash/ratelimit';
import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../utils';
import { Routes } from '../../../utils/constants';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(10, '10 m'),
});

export default async function checkout(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (!req.cookies.auth) return res.redirect(Routes.LOGIN_TO(Routes.PREMIUM));

	const user = await checkAuth(req, res);

	if (!user) return;

	if (process.env.NODE_ENV !== 'development')
		return res
			.status(400)
			.send({ message: 'This feature has been temporarily disabled.' });

	// rate limits
	const identifier = 'checkout:' + user.id;
	const result = await ratelimit.limit(identifier);
	res.setHeader('X-RateLimit-Limit', result.limit);
	res.setHeader('X-RateLimit-Remaining', result.remaining);
	res.setHeader('X-RateLimit-Reset', result.reset);

	if (!result.success) {
		res
			.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
			.status(429)
			.json(Errors[ErrorCodes.USER_LIMIT](result.reset - Date.now()));
		return;
	}

	// make sure the user can only have 25 subscriptions

	if ((await getSubscriptionCount(user.id)) >= 25)
		res.status(429).send(Errors[ErrorCodes.MAX_SUBSCRIPTIONS]);

	// get redirection url
	const origin = getOrigin(req, res);
	if (!origin) return;

	let { discord_guild_id: guild, price = 'monthly' } = req.query;
	guild = one(guild);
	price = one(price)!;

	// query validation
	let product: Products = one(req.query.product)?.toUpperCase() as any;

	if (guild && isNaN(parseInt(guild)))
		return res.status(400).send(Errors[ErrorCodes.INVALID_GUILD_ID]);

	if (product) {
		const str = product.toString();
		const int = parseInt(str);

		if (!isNaN(int) && typeof Products[int] !== 'undefined') {
			product = int;
		} else {
			product = Products[str.toString() as keyof typeof Products];
		}

		if (!product)
			return res.status(400).send(Errors[ErrorCodes.INVALID_PRODUCT]);
	} else {
		product = Products.PREMIUM;
	}

	if (!['monthly', 'yearly'].includes(price))
		return res.status(400).send(Errors[ErrorCodes.INVALID_PRICE]);

	const trial = one(req.query.trial) ?? 'true';
	if (!['true', 'false'].includes(trial))
		return res.status(400).send({ error: 'Invalid trial' });
	const shouldIncludeTrial = trial === 'true';

	if (price === 'yearly' && product === Products.MAILING_LIST)
		return res.status(400).send(Errors[ErrorCodes.INVALID_PRICE]);

	// failsafe to link customers

	const { email } = user;
	if (!email) return res.status(400).send(Errors[ErrorCodes.EMAIL_REQUIRED]);

	const customer = await getCustomer(user.id);

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price: Prices[product][price.toUpperCase()],
				quantity: 1,
			},
		],
		mode: 'subscription',
		subscription_data: shouldIncludeTrial ? { trial_period_days: 7 } : {},
		metadata: { discord_guild_id: guild ?? null, product, user_id: user.id },
		success_url: `${origin}/api/billing/complete?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/premium`,
		customer_email: !customer ? email! : undefined,
		customer: customer?.customer_id,
		allow_promotion_codes: true,
		consent_collection: {
			terms_of_service: 'required',
		},
	});

	return res.redirect(session.url!);
}
