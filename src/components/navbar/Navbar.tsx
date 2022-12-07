import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import { login } from '../../utils/actions/login';
import { createAnalyticsQuery } from '../../utils/analytics';
import { PrimaryButton } from '../brand/PrimaryButton';
import { Logo } from './Logo';

export default function Navbar() {
	const cookies = parseCookies();

	const router = useRouter();

	return (
		<HStack
			as='nav'
			justify='space-between'
			align='center'
			padding={6}
			minH={{ base: 'auto', md: '13vh' }}
			marginBottom={{ base: 3, md: 2 }}
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
					label='Dashboard'
					size='lg'
				/>
			</HStack>
		</HStack>
	);
}
