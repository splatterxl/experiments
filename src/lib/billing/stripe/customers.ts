import { stripe } from '@/lib/billing/stripe';
import Stripe from 'stripe';

export function getCustomer(id: string, expand: string[]) {
	return stripe.customers.retrieve(id, { expand });
}

export function setCustomerDefaultPaymentMethod(
	id: string,
	paymentMethod: string
) {
	return stripe.customers.update(id, {
		invoice_settings: {
			default_payment_method: paymentMethod,
		},
	});
}

export async function listPaymentMethods(
	id: string,
	type: Stripe.CustomerListPaymentMethodsParams.Type,
	expand: string[]
): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
	try {
		return await stripe.customers.listPaymentMethods(id, {
			expand,
			type,
		});
	} catch (err) {
		console.error(err);

		return {
			data: [],
			has_more: false,
			object: 'list',
			url: '',
		};
	}
}
