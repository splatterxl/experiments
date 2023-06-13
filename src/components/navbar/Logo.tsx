import { createAnalyticsQuery } from '@/lib/analytics/web';
import CurrentUserStore from '@/stores/CurrentUserStore';
import { Heading, HStack, Image, Link } from '@chakra-ui/react';
import { Montserrat } from '@next/font/google';
import { useRouter } from 'next/router';
import React from 'react';
import { Routes } from '../../utils/constants';
import { ASSETS } from '../../utils/constants/assets';

const montserrat = Montserrat({ subsets: ['latin'] });

export const Logo: React.FC = () => {
	const router = useRouter();
	const user = CurrentUserStore.useValue();

	const sizing =
		router.pathname === '/'
			? { logo: '4rem', text: '2xl' }
			: { logo: '3rem', text: 'xl' };

	return (
		<Link
			href={createAnalyticsQuery({
				path: user ? Routes.DASHBOARD : Routes.HOME,
				analytics: {
					from: 'navbar_logo',
				},
			})}
			_hover={{ textDecor: 'none' }}
		>
			<HStack spacing={4}>
				<Image boxSize={sizing.logo} alt='Experiments logo' src={ASSETS.Logo} />
				<Heading
					className={montserrat.className}
					size={sizing.text}
					paddingBottom={1}
					display={{ base: 'none', md: 'block' }}
					fontWeight={800}
					fontFamily="'Montserrat', -apple-system, BlinkMacSystemFont, Segoe UI, Roboto"
				>
					Experiments
				</Heading>
			</HStack>
		</Link>
	);
};
