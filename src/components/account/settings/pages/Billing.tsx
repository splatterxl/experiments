import { Center, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { BillingIndex } from './billing/Index';
import { Subscription } from './billing/Subscription';

export const Billing: React.FC = () => {
	const router = useRouter();

	switch (router.pathname) {
		case '/settings/billing/subscriptions/[sub_id]':
			return <Subscription />;
		case '/settings/[page]':
			return <BillingIndex />;
		default:
			return (
				<Center w='full' h='60vh'>
					<Spinner size='lg' />
				</Center>
			);
	}
};
