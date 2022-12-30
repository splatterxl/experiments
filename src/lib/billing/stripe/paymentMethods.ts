import { stripe } from '@/lib/billing/stripe';

export function getPaymentMethod(id: string, expand: string[]) {
	return stripe.paymentMethods.retrieve(id, { expand });
}
