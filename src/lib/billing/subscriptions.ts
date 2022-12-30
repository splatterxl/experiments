import { Products } from '@/lib/billing/constants';
import { getPaymentMethod } from '@/lib/billing/stripe/paymentMethods';
import { getProduct } from '@/lib/billing/stripe/products';
import { getSubscription } from '@/lib/billing/stripe/subscriptions';
import { SubscriptionData } from '@/lib/billing/types';
import { subscriptions } from '@/lib/db/collections';
import { Subscription, SubscriptionStatus } from '@/lib/db/models';
import { Snowflake } from 'discord-api-types/globals';
import { WithId } from 'mongodb';
import Stripe from 'stripe';

export async function updateSubscriptionState(
	subscriptionId: string,
	status: SubscriptionStatus
) {
	return subscriptions().updateOne(
		{ subscription_id: subscriptionId },
		{
			$set: {
				status,
			},
		}
	);
}
export async function setSubscriptionGuild(
	subscriptionId: string,
	guildId: Snowflake
) {
	return subscriptions().updateOne(
		{ subscription_id: subscriptionId },
		{
			$set: {
				guild_id: guildId,
			},
		}
	);
}

export async function getDbSubscription(userId: Snowflake, subId: string) {
	return subscriptions().findOne({
		user_id: userId,
		subscription_id: subId,
	});
}

export async function getDbSubscriptions(userId: Snowflake) {
	return subscriptions().find({ user_id: userId }).toArray();
}

export function getSubscriptionCountByProduct(
	guildId: Snowflake,
	product: Products
) {
	return subscriptions().countDocuments({
		guild_id: guildId,
		product: product,
	});
}

export function getSubscriptionCount(userId: Snowflake) {
	return subscriptions().countDocuments({ user_id: userId });
}

export const getSubscriptionData = async (
	subscription: WithId<Subscription>,
	extended = false,
	fetched?: Stripe.Response<Stripe.Subscription>
): Promise<SubscriptionData> => {
	const data =
		fetched ??
		(await getSubscription(subscription.subscription_id, [
			'default_payment_method',
			'items.data.price.product',
		]));
	let product = data.items.data[0].price.product as Stripe.Product | string;

	if (typeof product === 'string') {
		product = await getProduct(product, []);
	}

	const payment_method =
		typeof data.default_payment_method === 'string'
			? await getPaymentMethod(data.default_payment_method, [])
			: data.default_payment_method;

	const base: SubscriptionData = {
		id: data.id,
		status: subscription.status,
		user_id: subscription.user_id,
		guild_id: subscription.guild_id,
		product: {
			id: product.id,
			label: product.name,
			type:
				product.name === 'Premium' ? Products.PREMIUM : Products.MAILING_LIST,
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
		payment_method,
	};

	if (extended) {
		return {
			...base,
		};
	} else {
		return base;
	}
};
