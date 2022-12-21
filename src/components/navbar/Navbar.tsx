import { HStack, Text, useMediaQuery } from '@chakra-ui/react';
import type { APIUser } from 'discord-api-types/v10';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import React from 'react';
import { login } from '../../utils/actions/login';
import { createAnalyticsQuery } from '../../utils/analytics';
import { UserIcon } from '../account/UserIcon';
import { PrimaryButton } from '../brand/PrimaryButton';
import { Logo } from './Logo';

export default function Navbar() {
	const cookies = parseCookies();

	const [user, setUser] = React.useState<APIUser>(null as any);

	React.useEffect(() => {
		const item = localStorage.getItem('user');

		if (!cookies.auth) localStorage.removeItem('user');
		else if (item) setUser(JSON.parse(item));
	}, [cookies.auth]);

	const router = useRouter();

	const [isMobile] = useMediaQuery('(max-width: 512px)');

	return (
		<HStack
			as='nav'
			justify='space-between'
			align='center'
			paddingRight={8}
			paddingLeft={{ base: 6, md: 8 }}
			paddingTop={6}
			paddingBottom={4}
			minH={{ base: 'auto', md: '13vh' }}
		>
			<Logo />
			<HStack justify='flex-end' align='center' gap={4}>
				<Link
					href={createAnalyticsQuery({
						path: '/premium',
						analytics: {
							from: 'navbar'
						}
					})}
					passHref
					legacyBehavior
				>
					<Text
						as='a'
						fontWeight={500}
						display={{ base: 'none', md: 'inline-block' }}
					>
						Premium
					</Text>
				</Link>

				<PrimaryButton
					onClick={() => {
						if (!cookies.auth) login('navbar');
						else if (router.pathname !== '/dashboard')
							router.push(
								createAnalyticsQuery({
									path: '/dashboard',
									analytics: { from: 'navbar' }
								})
							);
					}}
					icon={
						user && !isMobile ? (
							<UserIcon
								size='xs'
								username={user.username + "'s"}
								id={user.id}
								avatar={user.avatar}
								discrim={user.discriminator}
							/>
						) : null
					}
					px={5}
					label='Dashboard'
					size='lg'
					role='link'
				/>
			</HStack>
		</HStack>
	);
}
