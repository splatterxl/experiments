import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../utils/billing/stripe';
import { Products } from '../../../utils/constants/billing';
import {
	client,
	Subscription,
	SubscriptionStatus
} from '../../../utils/database';

// Navigated to directly
export default async function result(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { searchParams } = new URL(req.url!, 'https://google.com');
	const id = searchParams.get('session_id');

	if (!id) return res.status(400).send({ error: 'Invalid session' });

	let session;
	try {
		session = await stripe.checkout.sessions.retrieve(id);
	} catch {
		return res.status(400).send({ error: 'Unknown session' });
	}

	const { user_id } = session.metadata!;

	switch (session.status) {
		case 'open':
			return res.redirect(session.url!);
		case 'expired':
			return res.redirect('/billing/premium');
		case 'complete': {
			switch (session.payment_status) {
				case 'unpaid':
					return res
						.status(400)
						.send({ error: 'Complete request with unpaid payment' });
				case 'no_payment_required':
				case 'paid': {
					let subscription_id;

					if (typeof session.subscription === 'string') {
						subscription_id = session.subscription;
					} else {
						subscription_id = session.subscription!.id;
					}

					const sub = await stripe.subscriptions.retrieve(subscription_id);

					let customer;

					if (typeof sub.customer === 'string') {
						customer = await stripe.customers.retrieve(sub.customer);
					} else {
						customer = sub.customer;
					}

					await client.collection<Subscription>('subscriptions').updateOne(
						{
							user_id: user_id,
							session_id: session.id
						},
						{
							$set: {
								user_id: user_id,
								status: SubscriptionStatus.ACTIVE,
								guild_id: session.metadata?.discord_guild_id || null,
								session_id: session.id,
								customer_id: customer.id,
								subscription_id: sub.id,
								product: +session.metadata!.product
							}
						},
						{ upsert: true }
					);

					await client.collection('customers').updateOne(
						{
							user_id
						},
						{
							$set: {
								customer_id: customer.id
							}
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
								user_id
							}
						});
					}

					return res.redirect(
						!session.metadata?.discord_guild_id
							? `/premium/liftoff?subscription=${sub.id}&product=${
									+session.metadata!.product === Products.MAILING_LIST
										? 'Mailing List'
										: +session.metadata!.product === Products.PREMIUM
										? 'Premium'
										: 'Unknown'
							  }`
							: `/dashboard/guild/${session.metadata!.discord_guild_id}/${
									+session.metadata!.product === Products.MAILING_LIST
										? 'mailing-list'
										: 'premium'
							  }/liftoff`
					);
				}
			}
		}
	}
}
