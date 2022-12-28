import { Heading, HStack, Image, Link } from '@chakra-ui/react';
import { Montserrat } from '@next/font/google';
import React from 'react';
import { createAnalyticsQuery } from '../../utils/analytics';
import { Routes } from '../../utils/constants';
import { ASSETS } from '../../utils/constants/assets';

const montserrat = Montserrat({ subsets: ['latin'] });

export const Logo: React.FC = () => {
	const sizing = { logo: '4rem', text: '2xl' };

	return (
		<Link
			href={createAnalyticsQuery({
				path: Routes.HOME,
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
