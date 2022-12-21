import { Ratelimit } from '@upstash/ratelimit';
import {
	APIGuild,
	PermissionFlagsBits,
	Snowflake
} from 'discord-api-types/v10';
import { Collection, WithId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { one } from '../../../../utils';
import { stripe } from '../../../../utils/billing/stripe';
import { Products } from '../../../../utils/constants/billing';
import {
	checkAuth,
	client,
	redis,
	Subscription
} from '../../../../utils/database';
import { getGuilds } from '../../user/guilds';

const ratelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(5, '5 s')
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		SubscriptionData | { message: string; reset_after?: number }
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

	const id = one(req.query.id);

	const coll = client.collection<Subscription>('subscriptions');

	const subscription = await coll.findOne({
		user_id: user.id,
		subscription_id: id
	});

	if (!subscription)
		return res.status(404).send({
			message: 'Unknown subscription'
		});

	const userGuilds = await getGuilds(user.access_token);

	if (!Array.isArray(userGuilds))
		return res.status(502).send({ message: 'Bad Gateway' });

	switch (req.method) {
		case 'PATCH': {
			const { body } = req;

			if ('guild_id' in body) {
				if (typeof body.guild_id !== 'string') {
					return res.status(400).send({ message: 'Invalid guild id' });
				}

				if (
					!userGuilds.find(
						(guild: APIGuild) =>
							guild.id === body.guild_id &&
							(BigInt(guild.permissions!) & PermissionFlagsBits.ManageGuild) ===
								PermissionFlagsBits.ManageGuild
					)
				)
					return res
						.status(422)
						.send({ message: 'User is not an admin of the target guild' });

				const count = await coll.countDocuments({
					guild_id: body.guild_id,
					product: subscription.product
				});

				if (count)
					return res.status(409).send({
						message:
							'A subscription of this type has already been applied to the guild'
					});

				coll.updateOne(
					{ user_id: user.id, subscription_id: id },
					{
						$set: {
							guild_id: body.guild_id
						}
					}
				);

				subscription.guild_id = body.guild_id;
			}
		}
		case 'GET':
			return res
				.status(200)
				.send(await getSubscriptionData(subscription, userGuilds, true, coll));
		case 'DELETE':
			try {
				await stripe.subscriptions.update(subscription.subscription_id, {
					cancel_at_period_end: true
				});

				return res.status(204).send('' as any);
			} catch (err: any) {
				return res.status(422).send({
					message: err.message
				});
			}
		case 'POST':
			try {
				await stripe.subscriptions.update(subscription.subscription_id, {
					cancel_at_period_end: false
				});

				return res.status(201).send('' as any);
			} catch (err: any) {
				return res.status(422).send({
					message: err.message
				});
			}
		default:
			return res.status(405).send({ message: 'Method Not Allowed' });
	}
}

export const getSubscriptionData = async (
	subscription: WithId<Subscription>,
	guilds: APIGuild[],
	extended = false,
	collection: Collection<Subscription>
): Promise<SubscriptionData> => {
	const data = await stripe.subscriptions.retrieve(
		subscription.subscription_id
	);
	const product = await stripe.products.retrieve(
		data.items.data[0].price.product as string
	);

	if ('product' in subscription === false) {
		// repair on read operation to insert product information into a subscription
		await collection.updateOne(
			{ _id: subscription._id },
			{
				$set: {
					product:
						product.name === 'Premium'
							? Products.PREMIUM
							: Products.MAILING_LIST
				}
			}
		);
	}

	const payment_method =
		typeof data.default_payment_method === 'string'
			? await stripe.paymentMethods.retrieve(data.default_payment_method)
			: data.default_payment_method;

	const base = {
		id: data.id,
		user_id: subscription.user_id,
		guild_id: subscription.guild_id,
		guild: guilds.find((guild) => guild.id === subscription.guild_id) ?? null,
		product: { id: product.id, label: product.name },
		currency: data.currency,
		price: data.items.data[0].price.unit_amount,
		trial_ends_at: data.trial_end,
		cancels_at:
			data.canceled_at ?? data.cancel_at_period_end ?? data.cancel_at
				? data.cancel_at ?? data.current_period_end
				: null,
		cancelled: !!data.ended_at,
		renews_at: data.current_period_end,
		payment_method: payment_method
			? { type: payment_method.type, last4: payment_method.card?.last4 }
			: null
	};

	if (extended) {
		return {
			...base
		};
	} else {
		return base;
	}
};

export interface SubscriptionData {
	id: string;
	user_id: Snowflake;
	guild_id?: Snowflake | null;
	guild: APIGuild | null;
	product: {
		id: string;
		label: string;
	};
	currency: string;
	price: number | null;
	trial_ends_at: number | null;
	cancels_at: number | null;
	cancelled: boolean;
	renews_at: number | null;
	payment_method?: {
		type: Stripe.PaymentMethod['type'];
		last4?: string;
	} | null;
}
