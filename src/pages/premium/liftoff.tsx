import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AssignSubscription } from '../../components/premium/AssignSubscription';
import Sparkles from '../../components/premium/Sparkles';
import { one } from '../../utils';

export default function Liftoff() {
	const router = useRouter();
	const product = one(router.query.product);
	const subscription = one(router.query.subscription);

	// React.useEffect(() => {
	// 	if (!subscription) router.replace('/premium');
	// }, []);

	// if (!subscription) {
	// 	return <></>;
	// }

	return (
		<>
			<Head>
				<title>Apply Subscription | Experiments</title>
			</Head>
			<VStack
				h='85vh'
				pb='20vh'
				flexDirection='column'
				textAlign='center'
				justify='center'
				gap={3}
				spacing={0}
			>
				<Box>
					<Heading as={Sparkles}>Thanks for subscribing!</Heading>
					<Text>
						Now, let&apos;s apply your subscription. You subscribed to:{' '}
						<Link
							href={{
								pathname: '/settings/billing/subscriptions/[sub_id]',
								query: { sub_id: subscription }
							}}
						>
							{product ?? 'Premium'}
						</Link>
					</Text>
				</Box>
				<AssignSubscription subscription={subscription!} product={product!} />
			</VStack>
		</>
	);
}
