import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../utils/billing/stripe';

export default async function result(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { searchParams } = new URL(req.url!, 'https://google.com');
	const id = searchParams.get('session_id');

	if (!id) return res.status(400).send({ error: 'Invalid session' });

	const session = await stripe.checkout.sessions.retrieve(id);

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

					if (customer.deleted) {
						await stripe.subscriptions.cancel(sub.id);

						return res.redirect('/');
					}

					return res.send({ session, customer, sub });
				}
			}
		}
	}
}
