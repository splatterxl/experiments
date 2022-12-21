import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { stripe } from '../../../utils/billing/stripe';
import { client, Subscription } from '../../../utils/database';

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
		case 'customer.subscription.deleted':
			const subscription = event.data as Stripe.Subscription;

			await client
				.collection<Subscription>('subscriptions')
				.deleteMany({ subscription_id: subscription.id });
	}

	res.send({ received: true });
};

export default handler;
