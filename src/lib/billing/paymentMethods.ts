import {
	getCustomer,
	listPaymentMethods,
} from '@/lib/billing/stripe/customers';
import { PaymentMethod } from '@/lib/billing/types';
import { getDbCustomer } from '@/lib/db';
import { Snowflake } from 'discord-api-types/globals';

export async function getPaymentMethods(userId: Snowflake) {
	const customer = await getDbCustomer(userId);

	if (!customer) return [];

	const stripeCustomer = await getCustomer(customer.customer_id, []);

	if (stripeCustomer.deleted) throw new Error('Deleted customer');

	return listPaymentMethods(stripeCustomer.id, undefined as any, []).then(
		(res) =>
			res.data.map(
				(v) =>
					({
						id: v.id,
						type: v.type,
						email: v.billing_details.email,
						exp: v.card?.exp_year
							? `${v.card.exp_month}/${v.card.exp_year}`
							: null,
						brand: v.card?.brand ?? null,
						eps: v.eps?.bank ?? null,
						ideal: v.ideal?.bank ?? null,
						last4: v.card?.last4 ?? null,
						wallet: v.card?.wallet ?? null,
						default:
							stripeCustomer.invoice_settings.default_payment_method === v.id,
					} as PaymentMethod)
			)
	);
}
