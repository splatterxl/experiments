import { Heading, HStack, List, ListItem } from '@chakra-ui/react';
import Link from 'next/link';

export const Footer = () => {
	return (
		<HStack w='full' borderTopWidth={1} p={6} pr={8} justify='space-between'>
			<Heading size='sm' fontWeight={500}>
				&copy; Experiments, 2022. All rights reserved.
			</Heading>
			<List fontWeight={400} as={HStack}>
				<ListItem>
					<Link href='/terms'>Terms of Service</Link>
				</ListItem>
				<ListItem>
					<Link href='/privacy'>Privacy Policy</Link>
				</ListItem>
			</List>
		</HStack>
	);
};
