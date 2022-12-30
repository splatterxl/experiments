import { stripe } from '@/lib/billing/stripe';

export function getProduct(id: string, expand: string[]) {
	return stripe.products.retrieve(id, { expand });
}
