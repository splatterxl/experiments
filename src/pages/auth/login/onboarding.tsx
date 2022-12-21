import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Center, Heading, HStack, Spinner, Text } from '@chakra-ui/react';
import type { APIUser } from 'discord-api-types/v10';
import { decode } from 'jsonwebtoken';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { destroyCookie, parseCookies } from 'nookies';
import React from 'react';
import { UserIcon } from '../../../components/account/UserIcon';
import { GhostButton } from '../../../components/brand/GhostButton';
import { one } from '../../../utils';

export default function LoginOnboarding() {
	const [user, setUser] = React.useState<APIUser>(null as any);

	const router = useRouter();

	React.useEffect(() => {
		(async () => {
			const { auth } = parseCookies();
			const scope = one(router.query.scope)?.split('+') ?? [
				'identify',
				'email'
			];

			if (!auth) router.replace('/auth/login/try-again');

			try {
				const user = (decode(auth) as APIUser)!;

				localStorage.setItem('user', JSON.stringify(user));
				localStorage.setItem('scope', JSON.stringify(scope));

				setUser(user);
			} catch (err) {
				console.error(err);

				destroyCookie(null, 'auth');

				router.replace('/auth/login/try-again');
			}
		})();
	}, [router]);

	return (
		<>
			<Head>
				<title>Login | Experiments</title>
			</Head>
			<Center h='85vh' pb='20vh' flexDirection='column' textAlign='center'>
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
						<Text
							fontSize='lg'
							maxW={{ base: '100%', md: '60vw' }}
							textAlign='center'
						>
							We&apos;re glad you could join us. Go to your personal dashboard
							to view activities and account settings.
						</Text>
						<GhostButton
							label='Go to Dashboard'
							icon={<ArrowForwardIcon />}
							iconPos='right'
							iconOnly={false}
							mt={3}
							href='/dashboard'
						/>
					</>
				) : (
					<Spinner size='lg' />
				)}
			</Center>
		</>
	);
}
