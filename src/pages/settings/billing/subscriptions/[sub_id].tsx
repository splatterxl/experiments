import SubscriptionHeader from '@/components/account/billing/SubscriptionHeader';
import {
	SettingsPage,
	SettingsPages,
} from '@/components/account/settings/Settings';
import { checkAuthProps } from '@/lib/auth/request';
import { PaymentMethods } from '@/lib/billing/constants';
import { getSubscription } from '@/lib/billing/stripe/subscriptions';
import {
	getDbSubscription,
	getSubscriptionData,
} from '@/lib/billing/subscriptions';
import { SubscriptionData } from '@/lib/billing/types';
import { SubscriptionStatus } from '@/lib/db/models';
import HTTPClient from '@/lib/http';
import GuildsStore from '@/stores/GuildsStore';
import { one } from '@/utils';
import { APIEndpoints, Routes } from '@/utils/constants';
import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	Center,
	Link,
	Spinner,
	Text,
	useDisclosure,
	useToast,
	VisuallyHidden,
	VStack,
} from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React from 'react';

interface SubscriptionProps {
	subData: SubscriptionData;
}

export default function Subscription({ subData }: SubscriptionProps) {
	const [subscription, setSubscription] =
		React.useState<SubscriptionData>(subData);
	const [cancelling, setCancelling] = React.useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = React.useRef<HTMLButtonElement>(null as any);

	const toast = useToast();

	const [guild, setGuild] = React.useState(undefined as any);
	const getGuild = GuildsStore.useGetItem(subscription.guild_id);

	React.useEffect(() => {
		setGuild(getGuild() ?? undefined);
	}, [getGuild]);

	return (
		<>
			<Head>
				<title>Settings | Experiments</title>
			</Head>
			<SettingsPage page={SettingsPages.BILLING}>
				{guild !== undefined ? (
					<VStack w='full' pt={2} pr={2} align='flex-start'>
						<SubscriptionHeader
							subscription={subscription}
							length={1}
							index={0}
							main
							guild={guild}
						/>
						<Text>
							{subscription.cancels_at ? (
								<>
									Your server will lose its perks on{' '}
									<b>
										{new Date(
											subscription.cancels_at * 1000
										).toLocaleDateString()}
									</b>
									.{' '}
									<Link
										onClick={() => {
											onOpen();
										}}
										textDecoration='underline'
									>
										Reinstate
									</Link>
								</>
							) : (
								<>
									You will be charged for{' '}
									<b>
										{new Intl.NumberFormat('en-GB', {
											style: 'currency',
											currency: subscription.currency.toUpperCase(),
										}).format(subscription.price! / 100)}
									</b>{' '}
									on{' '}
									<b>
										{new Date(
											subscription.renews_at! * 1000
										).toLocaleDateString()}
									</b>{' '}
									using{' '}
									{subscription.payment_method!.type === 'card' ? (
										<span>
											your card ending in{' '}
											<b>{subscription.payment_method!.last4}</b>
										</span>
									) : (
										<b>{PaymentMethods[subscription.payment_method!.type]}</b>
									)}
									.{' '}
									<Link
										onClick={() => {
											onOpen();
										}}
										textDecoration='underline'
									>
										Cancel
									</Link>
								</>
							)}
						</Text>

						<AlertDialog
							isOpen={isOpen}
							leastDestructiveRef={cancelRef}
							onClose={onClose}
						>
							<AlertDialogOverlay>
								<AlertDialogContent>
									<VisuallyHidden>
										<AlertDialogHeader>
											{subscription.cancels_at ? 'Reinstate' : 'Cancel'}{' '}
											Subscription
										</AlertDialogHeader>
									</VisuallyHidden>

									<AlertDialogBody pt={6}>
										Are you sure?{' '}
										{subscription.cancels_at ? (
											<>You will continue being charged.</>
										) : (
											<>
												{guild?.name ? <b>{guild.name}</b> : 'Your server'} will
												lose its perks on the next billing cycle.
											</>
										)}
									</AlertDialogBody>

									<AlertDialogFooter>
										<Button ref={cancelRef} onClick={onClose}>
											{subscription.cancels_at
												? 'Cancel'
												: 'No, keep my perks!'}
										</Button>
										<Button
											colorScheme='red'
											isLoading={cancelling}
											onClick={async () => {
												setCancelling(true);

												try {
													const res = await HTTPClient.patch<SubscriptionData>(
														APIEndpoints.SUBSCRIPTION(subscription.id),
														{
															status: subscription.cancels_at
																? SubscriptionStatus.ACTIVE
																: SubscriptionStatus.CANCELLED,
														}
													);

													if (res.ok) {
														setSubscription((sub) => ({
															...sub,
															cancels_at: subscription.cancels_at
																? null
																: sub.renews_at,
														}));
													} else {
														const { message } = await res.err;

														toast({
															description: message,
															status: 'error',
															position: 'bottom-right',
															isClosable: true,
														});
													}

													setCancelling(false);
												} catch {
													setCancelling(false);
												}

												onClose();
											}}
											ml={3}
										>
											{subscription.cancels_at ? 'Reinstate' : 'Confirm'}
										</Button>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialogOverlay>
						</AlertDialog>
					</VStack>
				) : (
					<Center w='full' h='60vh'>
						<Spinner size='lg' />
					</Center>
				)}
			</SettingsPage>
		</>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<SubscriptionProps>> {
	const auth = await checkAuthProps(context);

	if (!auth)
		return {
			redirect: {
				destination: Routes.LOGIN_TO(Routes.SETTINGS),
				permanent: false,
			},
		};

	const [user] = auth;

	const id = one(context.query.sub_id);

	if (!id?.startsWith('sub_'))
		return {
			notFound: true,
		};

	const subscription = await getDbSubscription(user.id, id);

	if (!subscription) return { notFound: true };

	const data = await getSubscription(id, ['default_payment_method']);

	const sub = await getSubscriptionData(subscription, true, data);

	return {
		props: {
			subData: sub,
		},
	};
}
