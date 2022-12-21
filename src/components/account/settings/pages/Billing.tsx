import { useRouter } from 'next/router';
import { BillingIndex } from './billing/Index';
import { Subscription } from './billing/Subscription';

export const Billing: React.FC = () => {
	const router = useRouter();

	return router.pathname === '/settings/billing/subscriptions/[sub_id]' ? (
		<Subscription />
	) : (
		<BillingIndex />
	);
};
