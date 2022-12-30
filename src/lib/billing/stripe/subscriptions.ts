import { stripe } from '@/lib/billing/stripe';

export function editSubscriptionCancelStatus(id: string, cancelled: boolean) {
	return stripe.subscriptions.update(id, {
		cancel_at_period_end: cancelled,
	});
}

export function getSubscription(id: string, expand: string[]) {
	return stripe.subscriptions.retrieve(id, { expand });
}
