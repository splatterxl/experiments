import { HStack, Link, useMediaQuery } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import CurrentUserStore from '../../stores/CurrentUserStore';
import { login } from '../../utils/actions/login';
import { createAnalyticsQuery } from '../../utils/analytics';
import { Routes } from '../../utils/constants';
import { UserIcon } from '../account/UserIcon';
import { PrimaryButton } from '../brand/PrimaryButton';
import { Logo } from './Logo';

export default function Navbar() {
	const cookies = parseCookies();

	const user = CurrentUserStore.useValue();

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
			suppressHydrationWarning
		>
			<Logo />
			<HStack justify='flex-end' align='center' gap={4}>
				<Link
					fontWeight={500}
					display={{ base: 'none', md: 'inline-block' }}
					href={createAnalyticsQuery({
						path: Routes.PREMIUM,
						analytics: {
							from: 'navbar',
						},
					})}
				>
					Premium
				</Link>

				<PrimaryButton
					onClick={() => {
						if (!cookies.auth) login('navbar', router.asPath);
						else if (router.pathname !== Routes.DASHBOARD)
							router.push(
								createAnalyticsQuery({
									path: Routes.DASHBOARD,
									analytics: { from: 'navbar' },
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
