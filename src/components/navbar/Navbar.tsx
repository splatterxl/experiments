import { HStack, Text } from '@chakra-ui/react';
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

		if (item) setUser(JSON.parse(item));
	}, []);

	const router = useRouter();

	return (
		<HStack
			as='nav'
			justify='space-between'
			align='center'
			padding={8}
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
					<Text as='a' fontWeight={500}>
						Premium
					</Text>
				</Link>
				<PrimaryButton
					onClick={() => {
						if (!cookies.auth) login('navbar');
						else if (router.pathname !== '/dashboard')
							router.push('/dashboard');
					}}
					icon={
						user ? (
							<UserIcon
								size='xs'
								username={user.username}
								id={user.id}
								avatar={user.avatar}
							/>
						) : null
					}
					pl={user ? 5 : undefined}
					label='Dashboard'
					size='lg'
				/>
			</HStack>
		</HStack>
	);
}
