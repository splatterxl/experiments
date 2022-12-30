import { ProductLabels, Products } from '@/lib/billing/constants';
import { stripe } from '@/lib/billing/stripe';
import { customers, subscriptions } from '@/lib/db/collections';
import { SubscriptionStatus } from '@/lib/db/models';
import { ErrorCodes, Errors } from '@/lib/errors';
import { getLoggerForRequest } from '@/lib/logger/api';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Routes } from '../../../utils/constants';

// Navigated to directly
export default async function result(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { searchParams } = new URL(req.url!, 'https://google.com');
	const id = searchParams.get('session_id');

	if (!id?.startsWith('cs_'))
		return res.status(400).send(Errors[ErrorCodes.INVALID_SESSION]);

	let session;
	try {
		session = await stripe.checkout.sessions.retrieve(id, {
			expand: ['subscription', 'customer'],
		});
	} catch {
		return res.status(400).send(Errors[ErrorCodes.UNKNOWN_SESSION]);
	}

	const { user_id } = session.metadata!;

	switch (session.status) {
		case 'open':
			return res.redirect(session.url!);
		case 'expired':
			return res.redirect(Routes.PREMIUM);
		case 'complete': {
			switch (session.payment_status) {
				case 'unpaid':
					return res.status(400).send(Errors[ErrorCodes.COMPLETE_UNPAID]);
				case 'no_payment_required':
				case 'paid': {
					const sub: Stripe.Subscription = session.subscription as any;
					const customer: Stripe.Customer = session.customer as any;

					await subscriptions().updateOne(
						{
							user_id: user_id,
							session_id: session.id,
						},
						{
							$set: {
								user_id: user_id,
								status: SubscriptionStatus.ACTIVE,
								guild_id: session.metadata?.discord_guild_id || null,
								session_id: session.id,
								customer_id: customer.id,
								subscription_id: sub.id,
								product: +session.metadata!.product,
							},
						},
						{ upsert: true }
					);

					await customers().updateOne(
						{
							user_id,
						},
						{
							$set: {
								customer_id: customer.id,
							},
						},
						{ upsert: true }
					);

					let payment_method_id =
						typeof sub.default_payment_method === 'string'
							? sub.default_payment_method
							: sub.default_payment_method?.id;

					if (payment_method_id) {
						await stripe.paymentMethods.update(payment_method_id, {
							metadata: {
								user_id,
							},
						});
					}

					getLoggerForRequest(req).info(
						{
							user: { id: user_id, email: customer.email },
							payment_method_id,
							product: Products[+session.metadata!.product],
							guild_id: session.metadata?.discord_guild_id || null,
							subscription_id: sub.id,
							has_trial: !!sub.trial_end,
						},
						`User subscribed to ${
							ProductLabels[+session.metadata!.product as Products]
						}`
					);

					return res.redirect(
						!session.metadata?.discord_guild_id
							? Routes.LIFTOFF(
									sub.id,
									ProductLabels[+session.metadata!.product as Products]
							  )
							: Routes.SERVER_LIFTOFF(
									session.metadata!.discord_guild_id,
									+session.metadata!.product === Products.MAILING_LIST
										? 'mailing-list'
										: 'premium'
							  )
					);
				}
			}
		}
	}
}
