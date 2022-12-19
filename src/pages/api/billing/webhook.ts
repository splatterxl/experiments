import { NextApiRequest, NextApiResponse } from 'next';
import { one } from '../../../utils';
import { stripe } from '../../../utils/billing/stripe';

export default function handleStripeWebhook(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const signature = one(req.headers['stripe-signature']);

	let event;

	try {
		event = stripe.webhooks.constructEvent(
			typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
			signature!,
			process.env.STRIPE_WEBOOK!
		);
	} catch (err: any) {
		res.status(400).send(`Webhook Error: ${err.toString()}`);
		return;
	}

	console.log(event.type);

	res.send('');
}
