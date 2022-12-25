import { Ratelimit } from '@upstash/ratelimit';
import { APIGuild, PermissionFlagsBits } from 'discord-api-types/v10';
import { EmailParams, Recipient } from 'mailersend';
import { Collection, WithId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { one } from '../../../../utils';
import { from, mailersend } from '../../../../utils/billing/email';
import { stripe } from '../../../../utils/billing/stripe';
import { Products } from '../../../../utils/constants/billing';
import { Templates } from '../../../../utils/constants/email';
import {
	checkAuth,
	client,
	redis,
	Subscription,
	SubscriptionStatus
} from '../../../../utils/database';
import { SubscriptionData } from '../../../../utils/types';
import { getGuilds } from '../../user/guilds';

const baseRatelimit = new Ratelimit({
	redis: redis,
	limiter: Ratelimit.fixedWindow(1, '2 s')
});

const cancelRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.fixedWindow(5, '2 m')
});

export default async function subscription(
	req: NextApiRequest,
	res: NextApiResponse<
		SubscriptionData | { message: string; reset_after?: number }
	>
) {
	const user = await checkAuth(req, res);

	if (!user) return;

	const identifier = 'subscription:' + user.id;
	const result = await baseRatelimit.limit(identifier);
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

	const data = await stripe.subscriptions.retrieve(
		subscription.subscription_id
	);
	const cancelled = subscription.status === SubscriptionStatus.CANCELLED;

	switch (req.method) {
		case 'PATCH': {
			if (cancelled) {
				return res
					.status(403)
					.send({ message: 'Cannot update a cancelled subscription' });
			}

			const { body } = req;

			if ('guild_id' in body) {
				if (typeof body.guild_id !== 'string') {
					return res.status(400).send({ message: 'Invalid guild id' });
				}

				if (body.guild_id !== subscription.guild_id) {
					if (
						!userGuilds.find(
							(guild: APIGuild) =>
								guild.id === body.guild_id &&
								(BigInt(guild.permissions!) &
									PermissionFlagsBits.ManageGuild) ===
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
		}
		case 'GET':
			return res
				.status(200)
				.send(
					await getSubscriptionData(subscription, userGuilds, true, coll, data)
				);
		case 'DELETE': {
			if (cancelled || subscription.status === SubscriptionStatus.FAILED)
				return res.status(204).send('' as any);

			const identifier = 'subscription_cancel:' + user.id;
			const result = await cancelRatelimit.limit(identifier);
			res.setHeader('X-RateLimit-Limit', result.limit);
			res.setHeader('X-RateLimit-Remaining', result.remaining);
			res.setHeader('X-RateLimit-Reset', result.reset);

			if (!result.success) {
				res.status(429).json({
					message: 'The resource is being rate limited.',
					reset_after: (result.reset - Date.now()) / 1000
				});
				return;
			}

			const host = req.headers.host;

			if (!host) return res.status(400).send({ message: 'Invalid host' });

			const url = new URL(
				req.url!,
				process.env.NODE_ENV === 'development'
					? `http://${host}`
					: `https://${host}`
			);

			try {
				await stripe.subscriptions.update(subscription.subscription_id, {
					cancel_at_period_end: true
				});

				await coll.updateOne(
					{ subscription_id: subscription.subscription_id },
					{
						$set: {
							status: SubscriptionStatus.CANCELLED
						}
					}
				);

				const recipients = [new Recipient(user.email!, user.username)];

				const variables = [
					{
						email: user.email!,
						substitutions: [
							{
								var: 'product',
								value:
									subscription.product === Products.MAILING_LIST
										? 'Mailing List'
										: 'Premium'
							},
							{
								var: 'expires_on',
								value: new Date(
									data.current_period_end * 1000
								).toLocaleDateString()
							},
							{
								var: 'name',
								value: user.username
							},
							{
								var: 'settings_page',
								value: `${url.origin}/settings/billing`
							},
							{
								var: 'reinstate_url',
								value: `${url.origin}/settings/billing/subscriptions/${subscription.subscription_id}`
							}
						]
					}
				];

				const emailParams = new EmailParams()
					.setFrom(from.email)
					.setFromName(from.name)
					.setRecipients(recipients)
					.setSubject(
						`Your ${
							subscription.product === Products.MAILING_LIST
								? 'Mailing List'
								: 'Premium'
						} subscription has been cancelled`
					)
					.setTemplateId(Templates.SUBSCRIPTION_CANCEL)
					.setVariables(variables as any);

				const resp = await mailersend.send(emailParams);

				return res.status(204).send('' as any);
			} catch (err: any) {
				return res.status(422).send({
					message: err.message
				});
			}
		}
		case 'POST': {
			if (!cancelled) return res.status(201).send('' as any);

			if (subscription.status === SubscriptionStatus.FAILED)
				return res
					.status(403)
					.send({ message: 'Cannot reinstate a failed subscription' });

			const identifier = 'subscription_cancel:' + user.id;
			const result = await cancelRatelimit.limit(identifier);
			res.setHeader('X-RateLimit-Limit', result.limit);
			res.setHeader('X-RateLimit-Remaining', result.remaining);
			res.setHeader('X-RateLimit-Reset', result.reset);

			if (!result.success) {
				res.status(429).json({
					message: 'The resource is being rate limited.',
					reset_after: (result.reset - Date.now()) / 1000
				});
				return;
			}

			try {
				await stripe.subscriptions.update(subscription.subscription_id, {
					cancel_at_period_end: false
				});

				await coll.updateOne(
					{ subscription_id: subscription.subscription_id },
					{
						$set: {
							status: SubscriptionStatus.ACTIVE
						}
					}
				);

				return res.status(201).send('' as any);
			} catch (err: any) {
				return res.status(422).send({
					message: err.message
				});
			}
		}
		default:
			return res.status(405).send({ message: 'Method Not Allowed' });
	}
}

export const getSubscriptionData = async (
	subscription: WithId<Subscription>,
	guilds: APIGuild[],
	extended = false,
	collection: Collection<Subscription>,
	fetched?: Stripe.Response<Stripe.Subscription>
): Promise<SubscriptionData> => {
	const data =
		fetched ??
		(await stripe.subscriptions.retrieve(subscription.subscription_id));
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
		status: subscription.status,
		user_id: subscription.user_id,
		guild_id: subscription.guild_id,
		guild: guilds.find((guild) => guild.id === subscription.guild_id) ?? null,
		product: {
			id: product.id,
			label: product.name,
			type:
				product.name === 'Premium' ? Products.PREMIUM : Products.MAILING_LIST
		},
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
