import {
	Box,
	Center,
	Heading,
	List,
	ListItem,
	Spinner,
	Text,
	VStack
} from '@chakra-ui/react';
import Link from 'next/link';
import React from 'react';
import type { SubscriptionData } from '../../../../../pages/api/billing/subscriptions/[id]';
import SubscriptionHeader from './SubscriptionHeader';

export const BillingIndex: React.FC = () => {
	const [subscriptions, setSubscriptions] = React.useState<SubscriptionData[]>(
		null as any
	);

	React.useEffect(() => {
		fetch('/api/billing/subscriptions').then(async (res) => {
			const json = await res.json();

			if (res.ok) setSubscriptions(json);
			else console.error(json);
		});
	}, []);

	return (
		<VStack justify='flex-start' w='full' align='flex-start'>
			{subscriptions ? (
				<Box as='section' w='full'>
					<Heading>Subscriptions</Heading>
					<Text>
						These are your current subscriptions. They will all be billed on the
						same cycle. You can cancel or re-assign your subscription at any
						time.
					</Text>
					{subscriptions.length ? (
						<List pt={5} w='full'>
							<ListItem w='full'>
								{subscriptions.map((subscription, i, a) => {
									return (
										<Link
											key={subscription.id}
											href={{
												pathname: '/settings/billing/subscriptions/[sub_id]',
												query: { sub_id: subscription.id }
											}}
										>
											<SubscriptionHeader
												subscription={subscription}
												index={i}
												length={a.length}
											/>
										</Link>
									);
								})}
							</ListItem>
						</List>
					) : (
						<Text pt={4} fontStyle='italic'>
							There&apos;s nothing here! Check out the{' '}
							<Link href='/premium'>available subscription plans</Link>?
						</Text>
					)}
				</Box>
			) : (
				<Center w='full' h='60vh'>
					<Spinner size='lg' />
				</Center>
			)}
		</VStack>
	);
};
