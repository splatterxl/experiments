import PaymentMethodSmall from '@/components/account/settings/pages/billing/payment-methods/PaymentMethodSmall';
import SubscriptionHeader from '@/components/account/settings/pages/billing/subscription/SubscriptionHeader';
import {
	SettingsPage,
	SettingsPages,
} from '@/components/account/settings/Settings';
import { checkAuthProps } from '@/lib/auth/request';
import { getPaymentMethods } from '@/lib/billing/paymentMethods';
import { getSubscriptions } from '@/lib/billing/subscriptions';
import { PaymentMethod, SubscriptionData } from '@/lib/billing/types';
import GuildsStore from '@/stores/GuildsStore';
import { Routes } from '@/utils/constants';
import { LockIcon } from '@chakra-ui/icons';
import {
	Box,
	Center,
	Heading,
	HStack,
	Link,
	List,
	ListItem,
	Spinner,
	Text,
	Tooltip,
	VStack,
} from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

interface BillingSettingsProps {
	subscriptions: SubscriptionData[];
	paymentMethods: PaymentMethod[];
}

export default function BillingSettings({
	subscriptions,
	paymentMethods,
}: BillingSettingsProps) {
	const guilds = GuildsStore.useValue();

	return (
		<SettingsPage page={SettingsPages.BILLING}>
			<VStack
				justify='flex-start'
				w='full'
				align='flex-start'
				pt={2}
				spacing={7}
			>
				<Box as='section' w='full'>
					<Heading size='2xl'>Subscriptions</Heading>
					<Text>
						These are your current subscriptions. They will all be billed on the
						same cycle. You can cancel or re-assign your subscription at any
						time.
					</Text>
					{subscriptions && guilds?.length ? (
						subscriptions.length ? (
							<List pt={5} w='full'>
								{subscriptions.map((subscription, i, a) => {
									return (
										<ListItem w='full' key={subscription.id}>
											<Link
												href={Routes.SUBSCRIPTION_SETTINGS(subscription.id)}
												_hover={{ textDecor: 'none' }}
											>
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
										<ListItem key={pm.id}>
											<PaymentMethodSmall pm={pm} index={i} length={a.length} />
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
		</SettingsPage>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<BillingSettingsProps>> {
	const auth = await checkAuthProps(context);

	if (!auth)
		return {
			redirect: {
				destination: Routes.LOGIN_TO(Routes.SETTINGS),
				permanent: false,
			},
		};

	const [user] = auth;

	const subscriptions = await getSubscriptions(user.id);
	const paymentMethods = await getPaymentMethods(user.id);

	return {
		props: {
			subscriptions,
			paymentMethods,
		},
	};
}
