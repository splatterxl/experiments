import { Heading, HStack, Image } from '@chakra-ui/react';
import { Montserrat } from '@next/font/google';
import Link from 'next/link';
import React from 'react';
import { createAnalyticsQuery } from '../../utils/analytics';
import { ASSETS } from '../../utils/constants/assets';

const montserrat = Montserrat({ subsets: ['latin'] });

export const Logo: React.FC = () => {
	const sizing = { logo: '4rem', text: '2xl' };

	return (
		<Link
			href={createAnalyticsQuery({
				path: '/',
				analytics: {
					from: 'navbar_logo'
				}
			})}
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
