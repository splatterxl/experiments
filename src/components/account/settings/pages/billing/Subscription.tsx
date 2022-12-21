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
	VStack
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { SubscriptionData } from '../../../../../pages/api/billing/subscriptions/[id]';
import { one } from '../../../../../utils';
import SubscriptionHeader from './SubscriptionHeader';

export const Subscription: React.FC = () => {
	const router = useRouter();
	const sub_id = one(router.query.sub_id);

	const [subscription, setSubscription] = React.useState<SubscriptionData>(
		null as any
	);
	const [cancelling, setCancelling] = React.useState(false);

	const { isOpen, onOpen, onClose } = useDisclosure();
	const cancelRef = React.useRef<HTMLButtonElement>(null as any);

	const toast = useToast();

	React.useEffect(() => {
		if (router.query.sub_id)
			fetch(`/api/billing/subscriptions/${sub_id}`).then(async (res) => {
				const json = await res.json();

				if (res.ok) setSubscription(json);
				else
					switch (res.status) {
						case 404:
							router.replace('/404', router.asPath, { shallow: true });
						default:
							console.error(json);
					}
			});
	}, [sub_id, router]);

	return subscription ? (
		<VStack w='full' pt={2} pr={2} align='flex-start'>
			<SubscriptionHeader subscription={subscription} length={1} index={0} />
			<Text>
				{subscription.cancels_at ? (
					<>
						Your server will lose its perks on{' '}
						<b>
							{new Date(subscription.cancels_at * 1000).toLocaleDateString()}
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
								currency: subscription.currency.toUpperCase()
							}).format(subscription.price! / 100)}
						</b>{' '}
						on{' '}
						<b>
							{new Date(subscription.renews_at! * 1000).toLocaleDateString()}
						</b>{' '}
						using{' '}
						{subscription.payment_method!.type === 'card' ? (
							<>
								your card ending in <b>{subscription.payment_method!.last4}</b>
							</>
						) : (
							<b>{subscription.payment_method?.type}</b>
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
								{subscription.cancels_at ? 'Reinstate' : 'Cancel'} Subscription
							</AlertDialogHeader>
						</VisuallyHidden>

						<AlertDialogBody pt={6}>
							Are you sure?{' '}
							{subscription.cancels_at ? (
								<>You will continue being charged.</>
							) : (
								<>
									<b>{subscription.guild?.name ?? 'your server'}</b> will lose
									its perks on the next billing cycle.
								</>
							)}
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onClose}>
								{subscription.cancels_at ? 'Cancel' : 'No, keep my perks!'}
							</Button>
							<Button
								colorScheme='red'
								isLoading={cancelling}
								onClick={async () => {
									setCancelling(true);

									try {
										const res = await fetch(
											`/api/billing/subscriptions/${subscription.id}`,
											{ method: subscription.cancels_at ? 'POST' : 'DELETE' }
										);

										if (res.ok) {
											setSubscription((sub) => ({
												...sub,
												cancels_at: subscription.cancels_at
													? null
													: sub.renews_at
											}));
										} else {
											const { message } = await res.json();

											toast({
												description: message,
												status: 'error',
												position: 'bottom-right',
												isClosable: true
											});
										}

										setCancelling(false);
										onClose();
									} catch {
										setCancelling(false);
									}
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
	);
};
