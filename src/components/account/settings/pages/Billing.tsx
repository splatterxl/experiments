import { Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { BillingIndex } from './billing/Index';
import { Subscription } from './billing/subscription/Subscription';

export const Billing: React.FC = () => {
	const router = useRouter();

	switch (router.pathname) {
		case '/settings/billing/subscriptions/[sub_id]':
			return <Subscription />;
		case '/settings/[page]':
		default:
			return <BillingIndex />;
	}
};
