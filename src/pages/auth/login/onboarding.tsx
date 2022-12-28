import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Center, Heading, HStack, Spinner, Text } from '@chakra-ui/react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { UserIcon } from '../../../components/account/UserIcon';
import { GhostButton } from '../../../components/brand/GhostButton';
import { Link } from '../../../components/Link';
import CurrentUserStore from '../../../stores/CurrentUserStore';
import { one } from '../../../utils';
import { Routes } from '../../../utils/constants';

export default function LoginOnboarding({ next }: { next: string }) {
	const [, setUser, user] = CurrentUserStore.useStateFromStorage();

	const router = useRouter();

	React.useEffect(() => {
		(async () => {
			if (next !== Routes.DASHBOARD) router.replace(next);
		})();
	}, [router, next, setUser]);

	return (
		<>
			<Head>
				<title>Login | Experiments</title>
			</Head>
			<Center
				h='85vh'
				pb='20vh'
				flexDirection='column'
				textAlign='center'
				suppressHydrationWarning
			>
				{user ? (
					<>
						<Heading>
							<HStack align='center'>
								<Text as='span'>Hi, </Text>
								<UserIcon
									size='sm'
									id={user.id}
									avatar={user.avatar}
									username={user.username}
									discrim={user.discriminator}
								/>
								<Text as='span'>{user.username}</Text>
							</HStack>
						</Heading>
						<Text fontSize='lg' px={16} textAlign='center'>
							We&apos;re glad you could join us.{' '}
							{next !== Routes.DASHBOARD ? (
								<>
									You&apos;ll be <Link href={next}>redirected</Link> soon.
								</>
							) : (
								<>
									Go to your personal dashboard to view activities and account
									settings.
								</>
							)}
						</Text>
						{next === Routes.DASHBOARD ? (
							<GhostButton
								label='Go to Dashboard'
								icon={<ArrowForwardIcon />}
								iconPos='right'
								iconOnly={false}
								mt={3}
								href={Routes.DASHBOARD}
							/>
						) : null}
					</>
				) : (
					<Spinner size='lg' />
				)}
			</Center>
		</>
	);
}

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ next: string }>> {
	let next = Routes.DASHBOARD;

	if (context.query.next) {
		try {
			next = new URL(one(context.query.next), 'https://google.com').pathname;
		} catch {}
	}

	return { props: { next } };
}
