import { HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { login } from '../../utils/actions/login';
import { createAnalyticsQuery } from '../../utils/analytics';
import { PrimaryButton } from '../brand/PrimaryButton';
import { Logo } from './Logo';

export default function Navbar() {
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
						login('navbar');
					}}
					label='Login'
					size='lg'
				/>
			</HStack>
		</HStack>
	);
}
