import { Heading, HStack, Image } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { createAnalyticsQuery } from '../../utils/analytics';
import { ASSETS } from '../../utils/constants/assets';

export const Logo: React.FC = () => {
	const router = useRouter();

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
					size={sizing.text}
					paddingBottom={1}
					display={{ base: 'none', md: 'block' }}
				>
					Experiments
				</Heading>
			</HStack>
		</Link>
	);
};
