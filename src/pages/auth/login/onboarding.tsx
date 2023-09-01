import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Center, Heading, Spinner, Text } from '@chakra-ui/react';
import { APIUser } from 'discord-api-types/v10';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { UserIcon } from '../../../components/account/UserIcon';
import { GhostButton } from '../../../components/brand/GhostButton';
import CurrentUserStore from '../../../stores/CurrentUserStore';
import { one } from '../../../utils';
import { Routes } from '../../../utils/constants';

export default function LoginOnboarding({ next }: { next: string }) {
	const [getUser, setUser] = CurrentUserStore.useStateFromStorage();
	const [user, setState] = React.useState<APIUser>(null as any);

	const router = useRouter();

	React.useEffect(() => {
		(async () => {
			if (next !== Routes.DASHBOARD) router.replace(next);
			else setState(getUser());
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router, next]);

	return (
		<>
			<Head>
				<title>Login | Experiments</title>
			</Head>
			<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
				{user ? (
					<>
						<Heading display='flex' alignItems='center' flexDir='row' gap={2}>
							<Text as='span'>Hi, </Text>
							<UserIcon
								size='sm'
								id={user.id}
								avatar={user.avatar}
								username={user.username}
								discrim={user.discriminator}
							/>
							<Text as='span'>{user.username}</Text>
						</Heading>
						<Text fontSize='lg' px={16} textAlign='center'>
							We&apos;re glad you could join us. Go to your dashboard to view
							experiment rollouts.
						</Text>
						<GhostButton
							label='Go to Dashboard'
							icon={<ArrowForwardIcon />}
							iconPos='right'
							iconOnly={false}
							mt={3}
							href={Routes.DASHBOARD}
						/>
					</>
				) : (
					<Spinner size='lg' />
				)}
			</Center>
		</>
	);
}

export const runtime = 'edge';

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ next: string }>> {
	let next = Routes.DASHBOARD;

	if (context.query.next) {
		try {
			next = new URL(one(context.query.next), 'https://google.com').pathname;
		} catch {}
	}

	if (!context.req.cookies.auth) {
		return {
			redirect: {
				destination: '/auth/login/try-again',
				permanent: false,
			},
		};
	}

	return { props: { next: next ?? Routes.DASHBOARD } };
}
