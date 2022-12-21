import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { destroyCookie } from 'nookies';
import React from 'react';
import { UserIcon } from '../../UserIcon';

export const General: React.FC<{ storage: typeof localStorage }> = ({
	storage: localStorage
}) => {
	const user = JSON.parse(localStorage.getItem('user')!);
	const scopes = JSON.parse(
		localStorage.getItem('scope') ?? JSON.stringify(['guilds', 'email'])
	);

	const router = useRouter();

	React.useEffect(() => {
		if (!user) {
			destroyCookie(null, 'auth');

			router.replace('/auth/login');
		}
	});

	if (!user) return <></>;

	return (
		<>
			<Heading pt={2}>
				<HStack align='center' spacing={4}>
					<UserIcon
						size='md'
						id={user.id}
						avatar={user.avatar}
						username={user.username}
						discrim={user.discriminator}
					/>
					<HStack pb={2} align='center' spacing={3}>
						<Box>
							<Text as='span'>{user.username}</Text>
							<Text as='span' fontSize='2xl' fontWeight={500}>
								#{user.discriminator}
							</Text>
						</Box>
						<Link href='/auth/logout' passHref legacyBehavior>
							<Text
								as='a'
								fontSize='md'
								fontWeight={200}
								pt={2}
								display={{ base: 'none', sm: 'inline-block' }}
							>
								Logout?
							</Text>
						</Link>
					</HStack>
				</HStack>
			</Heading>
			{!scopes.includes('guilds')}
		</>
	);
};
