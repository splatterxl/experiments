import { LockIcon } from '@chakra-ui/icons';
import {
	Box,
	Center,
	Heading,
	HStack,
	List,
	ListItem,
	Spinner,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v10';
import Link from 'next/link';
import React from 'react';
import GuildsStore from '../../../../../stores/GuildsStore';
import { APIEndpoints, makeURL, Routes } from '../../../../../utils/constants';
import { request } from '../../../../../utils/http';
import type {
	PaymentMethod,
	SubscriptionData,
} from '../../../../../utils/types';
import PaymentMethodHeader from './payment-methods/PaymentMethodHeader';
import SubscriptionHeader from './subscription/SubscriptionHeader';

export const BillingIndex: React.FC = () => {
	const [subscriptions, setSubscriptions] = React.useState<SubscriptionData[]>(
		null as any
	);
	const [paymentMethods, setPMs] = React.useState<PaymentMethod[]>(null as any);
	const [guilds, setGuilds] = React.useState<RESTAPIPartialCurrentUserGuild[]>(
		null as any
	);

	const getGuilds = GuildsStore.useGetFromStorage();

	React.useEffect(() => {
		request(makeURL(APIEndpoints.SUBSCRIPTIONS)).then(async (res) => {
			const json = await res.json();

			if (res.ok) setSubscriptions(json);
			else console.error(json);
		});
		request(makeURL(APIEndpoints.PAYMENT_METHODS)).then(async (res) => {
			const json = await res.json();

			if (res.ok) setPMs(json);
			else console.error(json);
		});

		setGuilds(getGuilds());
	}, []);

	return (
		<VStack justify='flex-start' w='full' align='flex-start' pt={2} spacing={7}>
			<Box as='section' w='full'>
				<Heading size='2xl'>Subscriptions</Heading>
				<Text>
					These are your current subscriptions. They will all be billed on the
					same cycle. You can cancel or re-assign your subscription at any time.
				</Text>
				{subscriptions && guilds?.length ? (
					subscriptions.length ? (
						<List pt={5} w='full'>
							{subscriptions.map((subscription, i, a) => {
								return (
									<ListItem w='full' key={subscription.id}>
										<Link href={Routes.SUBSCRIPTION_SETTINGS(subscription.id)}>
											<SubscriptionHeader
												subscription={subscription}
												index={i}
												length={a.length}
												guild={guilds.find(
													(v) => v.id === subscription.guild_id
												)}
											/>
										</Link>
									</ListItem>
								);
							})}
						</List>
					) : (
						<Text
							mt={4}
							p={6}
							rounded='xl'
							_dark={{ bgColor: 'gray.700' }}
							_light={{ bgColor: 'gray.200' }}
						>
							There&apos;s nothing here! Check out the{' '}
							<Link href={Routes.PREMIUM}>available subscription plans</Link>?
						</Text>
					)
				) : (
					<Center w='full' h='20vh'>
						<Spinner size='lg' />
					</Center>
				)}
			</Box>
			<Box as='section' w='full' pt={2}>
				<HStack>
					<Heading>Payment Methods</Heading>
					<Tooltip
						label='Your payment information is encrypted and securely stored by our payment gateway Stripe.'
						placement='top'
						bgColor='gray.600'
						color='white'
					>
						<LockIcon boxSize='1.7em' />
					</Tooltip>
				</HStack>
				<Text>
					Your payment methods are securely transmitted using Transport Layer
					Security (TLS) and encrypted at rest. Even we can&apos;t see them!
				</Text>
				{paymentMethods ? (
					paymentMethods.length ? (
						<List pt={5} w='full' display='flex' flexDir='column' gap={3}>
							{paymentMethods.map((pm, i, a) => {
								return (
									<ListItem key={i}>
										<PaymentMethodHeader pm={pm} index={i} length={a.length} />
									</ListItem>
								);
							})}
						</List>
					) : (
						<Text
							mt={4}
							p={6}
							rounded='xl'
							_dark={{ bgColor: 'gray.700' }}
							_light={{ bgColor: 'gray.200' }}
						>
							Purchase a subscription to add a payment method.
						</Text>
					)
				) : (
					<Center w='full' h='20vh'>
						<Spinner size='lg' />
					</Center>
				)}
			</Box>
		</VStack>
	);
};
