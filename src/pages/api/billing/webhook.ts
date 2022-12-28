import { EmailParams, Recipient } from 'mailersend';
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { from, mailersend } from '../../../utils/billing/email';
import { stripe } from '../../../utils/billing/stripe';
import { ProductLabels } from '../../../utils/constants/billing';
import { Templates } from '../../../utils/constants/email';
import {
	client,
	Subscription,
	SubscriptionStatus,
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

	const subColl = client.collection<Subscription>('subscriptions');

	switch (event.type) {
		case 'customer.subscription.trial_will_end': {
			const subscription = event.data.object as Stripe.Subscription;

			const host = req.headers.host;

			if (!host) return res.status(400).send({ message: 'Invalid host' });

			const url = new URL(
				req.url!,
				process.env.NODE_ENV === 'development'
					? `http://${host}`
					: `https://${host}`
			);

			const customer =
				typeof subscription.customer === 'string'
					? await stripe.customers.retrieve(subscription.customer)
					: subscription.customer;

			if (customer.deleted) {
				await stripe.subscriptions.cancel(subscription.id);
				break;
			}

			// unreachable
			if (!customer.email) break;

			const data = await subColl.findOne({ subscription_id: subscription.id });

			if (!data) break;

			const recipients = [new Recipient(customer.email)];

			const price = subscription.items.data[0].price;

			const variables = [
				{
					email: customer.email,
					substitutions: [
						{
							var: 'product',
							value: ProductLabels[data.product],
						},
						{
							var: 'expires_on',
							value: new Date(
								subscription.current_period_end * 1000
							).toLocaleDateString(),
						},
						{
							var: 'settings_page',
							value: `${url.origin}/settings/billing`,
						},
						{
							var: 'cancel_url',
							value: `${url.origin}/settings/billing/subscriptions/${subscription.id}`,
						},
						{
							var: 'cycle',
							value: price.recurring!.interval,
						},
						{
							var: 'price',
							value: new Intl.NumberFormat(undefined, {
								style: 'currency',
								currency: price.currency.toUpperCase(),
							}).format(price.unit_amount! / 100),
						},
					],
				},
			];

			const emailParams = new EmailParams()
				.setFrom(from.email)
				.setFromName(from.name)
				.setRecipients(recipients)
				.setSubject(`Your ${ProductLabels[data.product]} trial will end soon`)
				.setTemplateId(Templates.SUBSCRIPTION_TRIAL_WILL_END)
				.setVariables(variables as any);

			const resp = await mailersend.send(emailParams);

			if (!resp.ok) console.log(await resp.json());

			break;
		}
		case 'customer.subscription.updated': {
			const subscription = event.data.object as Stripe.Subscription;

			const data = await subColl.findOne({
				subscription_id: subscription.id,
			});

			if (!data) break;

			const updates: Partial<Subscription> = {};

			if (
				data.status === SubscriptionStatus.CANCELLED &&
				(!subscription.cancel_at_period_end || !subscription.cancel_at)
			) {
				updates.status = SubscriptionStatus.ACTIVE;
			}

			if (Object.keys(updates).length) {
				await subColl.updateOne(
					{ subscription_id: subscription.id },
					{
						$set: updates,
					}
				);
			}

			break;
		}
		case 'customer.subscription.deleted': {
			const subscription = event.data.object as Stripe.Subscription;

			await subColl.deleteMany({ subscription_id: subscription.id });

			break;
		}
		case 'payment_intent.payment_failed': {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;

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

			await subColl.updateOne(
				{ subscription_id: subId },
				{
					$set: {
						status: SubscriptionStatus.FAILED,
					},
				}
			);

			break;
		}
	}

	res.send({ received: true });
};

export default handler;
