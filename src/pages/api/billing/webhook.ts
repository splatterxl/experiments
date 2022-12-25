import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { stripe } from '../../../utils/billing/stripe';
import {
	client,
	Subscription,
	SubscriptionStatus
} from '../../../utils/database';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const signature = req.headers['stripe-signature'] as any;
	const reqBuffer = await buffer(req);

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			reqBuffer,
			signature,
			process.env.STRIPE_WEBHOOK!
		);
	} catch (error: any) {
		console.log(error);
		return res.status(400).send(`Webhook error: ${error.message}`);
	}

	switch (event.type) {
		case 'customer.subscription.deleted': {
			const subscription = event.data as Stripe.Subscription;

			await client
				.collection<Subscription>('subscriptions')
				.deleteMany({ subscription_id: subscription.id });

			break;
		}
		case 'payment_intent.payment_failed': {
			const paymentIntent = event.data as Stripe.PaymentIntent;

			const invoiceId =
				paymentIntent.invoice &&
				(typeof paymentIntent.invoice === 'string'
					? paymentIntent.invoice
					: paymentIntent.invoice.id);

			if (!invoiceId) break;

			const invoice = await stripe.invoices.retrieve(invoiceId);

			const subId =
				typeof invoice.subscription === 'string'
					? invoice.subscription
					: invoice.subscription?.id;

			if (!subId) break;

			await client.collection<Subscription>('subscriptions').updateOne(
				{ subscription_id: subId },
				{
					$set: {
						status: SubscriptionStatus.FAILED
					}
				}
			);
		}
	}

	res.send({ received: true });
};

export default handler;
