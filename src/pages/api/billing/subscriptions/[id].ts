import handle from '@/lib/api/schema';
import { getGuilds } from '@/lib/auth';
import { checkAuth } from '@/lib/auth/request';
import { ProductLabels } from '@/lib/billing/constants';
import {
	editSubscriptionCancelStatus,
	getSubscription,
} from '@/lib/billing/stripe/subscriptions';
import {
	getDbSubscription,
	getSubscriptionCountByProduct,
	getSubscriptionData,
	setSubscriptionGuild,
	updateSubscriptionState,
} from '@/lib/billing/subscriptions';
import { SubscriptionData } from '@/lib/billing/types';
import { redis } from '@/lib/db';
import { SubscriptionStatus } from '@/lib/db/models';
import { sendEmail } from '@/lib/email';
import { Templates } from '@/lib/email/constants';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getOrigin } from '@/lib/util';
import { one } from '@/utils';
import { s } from '@sapphire/shapeshift';
import { Ratelimit } from '@upstash/ratelimit';
import { APIGuild, PermissionFlagsBits } from 'discord-api-types/v10';
import { NextApiRequest, NextApiResponse } from 'next';

const baseRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.fixedWindow(1, '2 s'),
});

const cancelRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.fixedWindow(5, '2 m'),
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
		res
			.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
			.status(429)
			.json(Errors[ErrorCodes.USER_LIMIT]((result.reset - Date.now()) / 1000));
		return;
	}

	const id = one(req.query.id);

	if (!id?.startsWith('sub_'))
		return res.status(400).send(Errors[ErrorCodes.INVALID_SUBSCRIPTION_ID]);

	const subscription = await getDbSubscription(user.id, id);

	if (!subscription)
		return res.status(404).send(Errors[ErrorCodes.UNKNOWN_SUBSCRIPTION]);

	const data = await getSubscription(id, ['default_payment_method']);
	const cancelled = subscription.status === SubscriptionStatus.CANCELLED;

	switch (req.method) {
		case 'PATCH': {
			const body = handle(
				req,
				res,
				s.object({
					guild_id: s.string.regex(/\d{17,19}/).optional,
					payment_method: s.string.regex(/^pm_/).optional,
					status: s.enum(
						SubscriptionStatus.ACTIVE,
						SubscriptionStatus.CANCELLED
					).optional,
				})
			);

			if (!body) return;

			if (body.guild_id) {
				if (cancelled) {
					return res.status(403).send(Errors[ErrorCodes.UPDATE_CANCELLED_SUB]);
				}

				if (body.guild_id !== subscription.guild_id) {
					const userGuilds = await getGuilds(user.access_token);

					if (!Array.isArray(userGuilds))
						return res.status(502).send(Errors[ErrorCodes.BAD_GATEWAY]);

					if (
						!userGuilds.find(
							(guild: APIGuild) =>
								guild.id === body.guild_id &&
								(BigInt(guild.permissions!) &
									PermissionFlagsBits.ManageGuild) ===
									PermissionFlagsBits.ManageGuild
						)
					)
						return res.status(422).send(Errors[ErrorCodes.USER_NOT_ADMIN]);

					const count = await getSubscriptionCountByProduct(
						body.guild_id,
						subscription.product
					);

					if (count)
						return res
							.status(409)
							.send(Errors[ErrorCodes.SUBSCRIPTION_ALREADY_APPLIED]);

					await setSubscriptionGuild(
						subscription.subscription_id,
						body.guild_id
					);

					subscription.guild_id = body.guild_id;
				}
			}

			if (body.status != null) {
				const identifier = 'subscription_cancel:' + user.id;
				const result = await cancelRatelimit.limit(identifier);
				res.setHeader('X-RateLimit-Limit', result.limit);
				res.setHeader('X-RateLimit-Remaining', result.remaining);
				res.setHeader('X-RateLimit-Reset', result.reset);
				if (!result.success) {
					res
						.setHeader('Retry-After', (result.reset - Date.now()) / 1000)
						.status(429)
						.json(
							Errors[ErrorCodes.RESOURCE_LIMIT](
								(result.reset - Date.now()) / 1000
							)
						);
					return;
				}

				switch (body.status) {
					case SubscriptionStatus.ACTIVE: {
						if (subscription.status === SubscriptionStatus.ACTIVE) {
							break;
						}

						if (subscription.status === SubscriptionStatus.FAILED) {
							return res
								.status(403)
								.send(Errors[ErrorCodes.REINSTATE_FAILED_SUB]);
						}

						try {
							await editSubscriptionCancelStatus(
								subscription.subscription_id,
								false
							);
							await updateSubscriptionState(
								subscription.subscription_id,
								SubscriptionStatus.ACTIVE
							);

							user.logger.info(
								{
									subscription: subscription.subscription_id,
									customer: subscription.customer_id,
								},
								'User reinstated subscription'
							);

							break;
						} catch (err: any) {
							return res.status(422).send({
								message: err.message,
							});
						}
					}
					case SubscriptionStatus.CANCELLED: {
						if (
							[
								SubscriptionStatus.CANCELLED,
								SubscriptionStatus.FAILED,
							].includes(subscription.status)
						) {
							break;
						}

						const origin = getOrigin(req, res);

						if (!origin) return;

						try {
							await editSubscriptionCancelStatus(
								subscription.subscription_id,
								true
							);
							await updateSubscriptionState(
								subscription.subscription_id,
								SubscriptionStatus.CANCELLED
							);

							user.logger.info(
								{
									subscription: subscription.subscription_id,
									customer: subscription.customer_id,
								},
								'User cancelled subscription'
							);

							await sendEmail(
								{
									email: user.email!,
									name: user.username,
								},
								{
									subject: `Your ${
										ProductLabels[subscription.product]
									} subscription has been cancelled`,
									template: Templates.SUBSCRIPTION_CANCEL,
									attachments: [],
									variables: {
										email: user.email!,
										substitutions: [
											{
												var: 'product',
												value: ProductLabels[subscription.product],
											},
											{
												var: 'expires_on',
												value: new Date(
													data.current_period_end * 1000
												).toLocaleDateString(),
											},
											{
												var: 'name',
												value: user.username,
											},
											{
												var: 'settings_page',
												value: `${origin}/settings/billing`,
											},
											{
												var: 'reinstate_url',
												value: `${origin}/settings/billing/subscriptions/${subscription.subscription_id}`,
											},
										],
									},
								}
							);

							break;
						} catch (err: any) {
							return res.status(422).send({
								message: err.message,
							});
						}
					}
				}

				subscription.status = body.status;
			}

			return res
				.status(200)
				.send(await getSubscriptionData(subscription, true, data));
		}
		default:
			return res.status(405).send(Errors[ErrorCodes.METHOD_NOT_ALLOWED]);
	}
}
